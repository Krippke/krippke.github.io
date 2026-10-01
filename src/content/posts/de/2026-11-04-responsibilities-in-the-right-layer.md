---
title: "Verantwortung in der richtigen Schicht"
excerpt: "Geschäftsregeln im SQL, Datumsformatierung im Backend, die Systemuhr in der Domäne. Wenn Verantwortung in der falschen Schicht liegt, breitet sich jede Änderung aus. Wo jede Verantwortung hingehört und warum die Abhängigkeitsregel alles zusammenhält."
date: 2026-11-04 06:00:00 +0100
updated: 2026-11-04T06:00:00+01:00
teaser: /assets/images/right-layer.jpg
tags: [clean-architecture, hexagonal-architecture, software-architecture, refactoring, maintainability]
slug: verantwortung-in-der-richtigen-schicht
---

Dieser Beitrag ist der letzte Teil der Serie :series-link[Die versteckten Kosten von nicht wartbarem Code]{slug="the-hidden-cost-of-unmaintainable-code"}. Ein neuer Entwickler soll in einem Onlineshop eine kleine Änderung umsetzen: „Im Dezember aufgegebene Bestellungen können bis zum 31. Januar zurückgegeben werden.“ Er hat :series-link[Tests eingezogen]{slug="refactoring-legacy-code-without-fear"}, :series-link[der Rückgabefrist einen Namen gegeben]{slug="making-implicit-concepts-explicit"}, :series-link[ihre Kopien an einem Ort zusammengeführt]{slug="one-decision-one-place"} und :series-link[die Klasse aufgeteilt, die zu vielen Abteilungen gedient hat]{slug="one-responsibility-per-component"}. Eine Frage bleibt: Wo gehört jedes Teil eigentlich hin?

Beim Zusammenführen der Rückgabefrist findet der Entwickler sie immer wieder an Stellen, an denen sie nichts zu suchen hat. Die API baut einen fertigen Satz für den Shop:

```kotlin
returnHint = "Return until ${order.deliveredAt!!.plusDays(14).format(DateTimeFormatter.ofPattern("dd.MM.yyyy"))}",
returnHintColor = if (ChronoUnit.DAYS.between(LocalDateTime.now(), order.deliveredAt!!.plusDays(14)) <= 3) "red" else "grey",
```

Der Bericht des Kundenservice hat die Regel in seiner `WHERE`-Klausel. Und die Klasse `Order` ist eine JPA-Entity, die zusätzlich Geschäftslogik enthält und die Systemuhr liest:

```kotlin
@Entity
@Table(name = "orders")
class Order(
    @Id val id: Long,
    var status: Int,
    var orderedAt: LocalDateTime,
    var deliveredAt: LocalDateTime?,
) {
    fun isReturnable() =
        status == 4 && deliveredAt!!.plusDays(14) >= LocalDateTime.now()
}
```

Jede dieser Stellen funktioniert. Und jede ist ein Ort, an dem eine Änderung der Rückgabefrist umgesetzt, getestet und deployt werden muss, obwohl sich die UI, die Datenbank und das ORM überhaupt nicht für Rückgabefristen interessieren sollten.

## Warum die Schicht wichtig ist

Wenn eine Verantwortung in der falschen Schicht liegt, passieren zwei Dinge.

Erstens breiten sich Änderungen aus. Eine Geschäftsregel im SQL bedeutet: Eine fachliche Änderung braucht eine Datenbankänderung. Ein Datumsformat im Backend bedeutet: Eine Designänderung braucht ein Backend-Deployment. Schichten, die unabhängig sein sollten, werden in jede Änderung hineingezogen.

Zweitens wird der Code schwerer verständlich. Um zu verstehen, wie die Rückgabefrist funktioniert, muss der Entwickler Kotlin, SQL, JavaScript und ein E-Mail-Template lesen. Um sie zu testen, braucht er eine Datenbank und eine eingefrorene Systemuhr. Die kognitive Last einer einfachen Regel verteilt sich über den gesamten Stack.

Die Idee hinter Schichten ist einfach: Jede Schicht hat eine Art von Verantwortung, und nur diese eine.

- Die **UI** entscheidet, wie etwas aussieht.
- Die **Persistenz** speichert Zustand und stellt ihn wieder her.
- Die **Domäne** kennt die Geschäftsregeln und nichts über Technik.
- Die **Anwendungsschicht** orchestriert die Domäne und hält externe Abhängigkeiten hinter Ports.

Gehen wir sie der Reihe nach durch.

## Die UI: nur das Aussehen

Die API oben erledigt zwei Aufgaben, die in die UI gehören: ein Datum formatieren und eine Farbe auswählen. Außerdem enthält sie noch eine weitere Kopie der Regel für die Rückgabefrist.

Nach dem Refactoring liefert die API Fakten, keine Darstellung:

```kotlin
returnPeriodEndsOn = order.returnPeriod?.endsOn,
returnPeriodEndsSoon = order.returnPeriod?.endsSoon(today) ?: false,
```

Und das Frontend entscheidet, wie es sie anzeigt:

```javascript
function returnHint(order) {
  return {
    text: `Return until ${formatDate(order.returnPeriodEndsOn)}`,
    urgent: order.returnPeriodEndsSoon,
  };
}
```

Warum liegt „endet bald“ in der Domäne und nicht in der UI? Weil es eine Geschäftsregel ist. Der Kundenservice verschickt außerdem drei Tage vor Ende der Frist eine E-Mail „Letzte Chance zur Rückgabe“. Wenn die UI entscheiden würde, was „bald“ bedeutet, gäbe es diese Entscheidung zweimal. Ob „bald“ rot, mit einem Icon oder gar nicht angezeigt wird, ist eine Entscheidung der UI.

Das ist das Humble-Object-Pattern: Die UI enthält so wenig Logik wie möglich, also gibt es wenig zu testen. Die Kommunikation mit dem Backend prüfe ich mit Smoke-Tests, die UI teste ich manuell. Alles Verhalten, das sich automatisiert zu testen lohnt, liegt in Schichten, die leicht zu testen sind.

## Persistenz: Zustand speichern und wiederherstellen

Der Bericht des Kundenservice hatte die Rückgabefrist in seiner Abfrage:

```sql
SELECT * FROM orders
WHERE status = 4
  AND delivered_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 weeks';
```

Das ist eine Geschäftsregel, geschrieben in SQL. Wenn die Dezember-Regel kommt, muss jemand daran denken, auch diese Abfrage zu ändern. Und niemand wird es tun, weil niemand an einen Bericht denkt, wenn er eine Geschäftsregel ändert.

Die Lösung: Die Domäne trifft die Entscheidung einmal, und die Persistenz speichert das Ergebnis. Die Rückgaberegelung wird angewendet, wenn die Bestellung zugestellt wird:

```kotlin
fun markDelivered(on: LocalDate, returnPolicy: ReturnPolicy) {
    status = OrderStatus.DELIVERED
    deliveredOn = on
    returnPeriod = returnPolicy.returnPeriodFor(orderedOn, deliveredOn = on)
}
```

Das Repository speichert das Ende der Rückgabefrist als Spalte, wie jeden anderen Zustand auch:

```kotlin
class PostgresOrderRepository(private val jdbc: JdbcTemplate) : OrderRepository {
    override fun save(order: Order) {
        jdbc.update(
            "UPDATE orders SET status = ?, delivered_on = ?, return_period_ends_on = ? WHERE id = ?",
            order.status.name, order.deliveredOn, order.returnPeriod?.endsOn, order.id,
        )
    }
}
```

Und der Bericht kennt keine Regel mehr. Er filtert nach Zustand:

```sql
SELECT id, customer_name, return_period_ends_on FROM orders
WHERE status = 'DELIVERED'
  AND return_period_ends_on >= :today;
```

Die Abfrage ist schnell, sie ist einfach, und sie kann nie wieder im Widerspruch zur Domäne stehen, weil sie nichts entscheidet.

## Die Domäne: frei von technischen Details

Die JPA-Entity hat drei Dinge vermischt: das Datenbank-Mapping, die Geschäftsregel und die Systemuhr. Dadurch ist die Regel schwer zu testen, und die Geschäftslogik hängt an einem bestimmten Framework.

Nach dem Refactoring ist die Domäne reines Kotlin:

```kotlin
class Order(
    val id: Long,
    val orderedOn: LocalDate,
    status: OrderStatus,
    deliveredOn: LocalDate? = null,
    returnPeriod: ReturnPeriod? = null,
) {
    var status = status
        private set
    var deliveredOn = deliveredOn
        private set
    var returnPeriod = returnPeriod
        private set

    fun markDelivered(on: LocalDate, returnPolicy: ReturnPolicy) {
        status = OrderStatus.DELIVERED
        deliveredOn = on
        returnPeriod = returnPolicy.returnPeriodFor(orderedOn, deliveredOn = on)
    }

    fun requestReturn(today: LocalDate) {
        val period = returnPeriod
        if (!isDelivered() || period == null) throw OrderNotDelivered(id)
        if (!period.allowsReturnOn(today)) throw ReturnPeriodExpired(period)
        status = OrderStatus.RETURN_REQUESTED
    }

    fun isDelivered(): Boolean = status == OrderStatus.DELIVERED
}
```

Keine JPA-Annotationen, keine Datenbank, kein `LocalDateTime.now()`. Der aktuelle Tag wird hereingereicht. Das Mapping zwischen Datenbankzeile und Domänenobjekt liegt im Repository, wo es hingehört.

Die Domänentests brauchen nichts außer der Domäne:

```kotlin
@Test
fun `return is rejected after the return period has ended`() {
    val order = aDeliveredOrder(returnPeriod = ReturnPeriod(endsOn = LocalDate.of(2026, 3, 15)))

    assertFailsWith<ReturnPeriodExpired> {
        order.requestReturn(today = LocalDate.of(2026, 3, 16))
    }
}
```

## Die Anwendungsschicht: orchestrieren und entkoppeln

Irgendjemand muss die Bestellung laden, die Uhr nach dem heutigen Tag fragen, die Domäne entscheiden lassen, das Ergebnis speichern und den Kunden benachrichtigen. Das ist die Aufgabe der Anwendungsschicht:

```kotlin
class RequestReturn(
    private val orders: OrderRepository,
    private val clock: Clock,
    private val notifications: CustomerNotifications,
) {
    fun execute(orderId: Long) {
        val order = orders.get(orderId)
        order.requestReturn(today = clock.today())
        orders.save(order)
        notifications.returnConfirmed(order)
    }
}
```

`OrderRepository`, `Clock` und `CustomerNotifications` sind Ports: Interfaces in der Sprache der Anwendung. Die Implementierungen sind Adapter auf der Außenseite. Die Uhr ist ein gutes Beispiel dafür, wie klein so ein Port sein kann:

```kotlin
interface Clock {
    fun today(): LocalDate
}

class SystemClock(private val zone: ZoneId) : Clock {
    override fun today(): LocalDate = LocalDate.now(zone)
}
```

Erinnerst du dich an die Frage, welche Zeitzone die Rückgabefrist verwendet? Der Kundenservice hat entschieden: die Ortszeit des Shops. Diese Entscheidung liegt jetzt an genau einem Ort, in der Konfiguration der `SystemClock`. In Tests liefert eine `FixedClock` genau den Tag, den der Test braucht.

Für externe Systeme wie Zahlungsanbieter braucht dasselbe Muster etwas mehr Struktur. Das habe ich ausführlich in :series-link[Fremdsysteme werden sich ändern – so bist du vorbereitet]{slug="foreign-systems-will-change-heres-how-to-be-ready"} beschrieben.

## Die Abhängigkeitsregel hält alles zusammen

Das alles funktioniert nur wegen einer Regel: Abhängigkeiten zeigen nach innen.

```
UI  ──►  Application  ──►  Domain
              ▲
Adapters ─────┘   (implement the ports: database, email, clock)
```

Die Domäne hängt von nichts ab. Die Anwendungsschicht hängt von der Domäne ab und definiert die Ports, die sie braucht. Die UI und die Adapter hängen von der Anwendungsschicht ab, niemals umgekehrt. Die Domäne importiert nie etwas aus der Datenbank, dem Web-Framework oder der Mail-Bibliothek.

Deshalb ließ sich die Dezember-Regel umsetzen, ohne die Datenbank, das Frontend oder die E-Mail anzufassen. Die Regel lebt in der Domäne, und nichts in der Domäne weiß von diesen Dingen. Robert C. Martin nennt das in *Clean Architecture* die Abhängigkeitsregel (Dependency Rule). Alistair Cockburn hat dieselbe Idee schon früher als hexagonale Architektur beschrieben, auch bekannt als Ports and Adapters.

## Wo es schwierig wird

**Gespeicherte Entscheidungen oder berechnete.** Wenn das Ende der Rückgabefrist bei der Zustellung gespeichert wird, bleibt der Bericht einfach und konsistent. Es bedeutet aber auch, dass eine Regeländerung nur für Bestellungen gilt, die nach der Änderung zugestellt werden. Für die Dezember-Regel ist das genau richtig. Bei anderen Regeln möchte das Business vielleicht, dass sie rückwirkend gelten. Das ist eine fachliche Frage, keine technische, und es lohnt sich, sie zu stellen, bevor du dich entscheidest.

**Mapping-Code.** Die Domäne vom ORM zu trennen bedeutet, Code zu schreiben, der zwischen Datenbankzeilen und Domänenobjekten mappt. Das fühlt sich nach Boilerplate an. Meiner Erfahrung nach ist es ein kleiner Preis für eine Domäne, die sich ohne Datenbank verstehen und testen lässt.

**Nicht jede Software braucht all das.** Ein einfaches Formular, das in eine Tabelle schreibt, braucht keine Domänenschicht. Die Schichtung zahlt sich dort aus, wo es Geschäftsregeln gibt, die es wert sind, geschützt zu werden. Die Rückgabefrist ist eine davon. Die meisten Legacy-Systeme haben viele.

## Jede Verantwortung an ihrem Platz

Am Ende der Serie besteht das Dezember-Ticket des Entwicklers aus einer neuen Klasse und einem neuen Test. Nicht weil die Regel einfacher geworden ist, sondern weil jede Verantwortung um sie herum ihren Platz gefunden hat. Die UI zeigt, was sie bekommt. Die Persistenz speichert, was man ihr sagt. Die Domäne entscheidet. Die Anwendungsschicht orchestriert.

Das Ergebnis ist nicht clever. Es ist einfacher, langweiliger Code, der tut, was er soll. Und der nächste Entwickler, der ihn ändert, muss keine Angst haben.
