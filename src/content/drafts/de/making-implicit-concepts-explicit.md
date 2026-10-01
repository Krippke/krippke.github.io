---
title: "Implizite Konzepte explizit machen"
excerpt: "Das Konzept, über das dein Fachbereich jeden Tag spricht, existiert in deinem Code oft gar nicht. Wie du implizite Konzepte findest, wie du sie in der Struktur des Codes ausdrückst und warum dadurch aus kompliziertem Code einfacher Code wird."
teaser: /assets/images/implicit-concepts.jpg
tags: [domain-driven-design, refactoring, legacy-code, maintainability, clean-code]
slug: implizite-konzepte-explizit-machen
---

Dieser Beitrag ist Teil der Serie :series-link[Die versteckten Kosten von nicht wartbarem Code]{slug="the-hidden-cost-of-unmaintainable-code"}. Ein neuer Entwickler soll in einem Onlineshop eine kleine Änderung umsetzen: „Im Dezember aufgegebene Bestellungen können bis zum 31. Januar zurückgegeben werden.“ Er hat bereits :series-link[ein Sicherheitsnetz aus Tests aufgespannt]{slug="refactoring-legacy-code-without-fear"}. Jetzt will er die Rückgabefrist im Code finden.

Er sucht nach „return period“. Nichts. „Return deadline“. Nichts. „Returnable“. Nichts.

Der Kundenservice spricht jeden Tag über die Rückgabefrist. Sie steht in den AGB, auf den Produktseiten, in jedem zweiten Support-Ticket. Aber im Code existiert sie nicht. Was existiert, ist das hier:

```kotlin
private fun withinDeadline(order: Order) =
    order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
```

Und ein paar Zeilen darüber:

```kotlin
if (order.status != 4) throw IllegalStateException("Order not delivered")
```

Das Konzept ist da. Es ist nur implizit – versteckt in Arithmetik, einer Magic Number und einem Methodennamen, der alles Mögliche bedeuten könnte.

## Was ein implizites Konzept kostet

Ein implizites Konzept ist ein Stück Fachwissen, auf das sich der Code verlässt, das er aber nie benennt. Der Code funktioniert. Aber um ihn zu verstehen, muss ein Entwickler das Konzept jedes Mal aufs Neue aus der Implementierung rekonstruieren.

`deliveredAt!!.plusDays(14) >= LocalDateTime.now()` sagt dir, was berechnet wird. Es sagt dir nicht, warum, was die 14 bedeutet, ob sie sich jemals ändert oder wer das entscheidet. Der ursprüngliche Entwickler wusste es. Dieses Wissen wurde nie in den Code geschrieben, und als er ging, ging es mit ihm.

Das ist kognitive Last in ihrer reinsten Form. Jeder Entwickler, der diesen Code anfasst, muss die Übersetzung im Kopf behalten: „Deadline heißt Rückgabefrist, 4 heißt geliefert, 14 ist eine fachliche Entscheidung, keine technische Konstante“. Vergisst du eins davon, baust du einen Bug.

Und es wird noch schlimmer. Weil das Konzept kein Zuhause hat, baut sich jeder Entwickler, der es braucht, seine eigene Version. Das Frontend berechnet seine eigene Rückgabefrist. Der Report berechnet seine eigene. So werden aus impliziten Konzepten :series-link[Entscheidungen, die über das ganze System verteilt sind]{slug="one-decision-one-place"}, und diese Entscheidungen driften auseinander.

## Wie du implizite Konzepte findest

Eric Evans widmet diesem Thema in *Domain-Driven Design* ein ganzes Kapitel mit dem Titel „Making Implicit Concepts Explicit“. Sein Rat beginnt damit, der Sprache der Fachexperten zuzuhören und die Stellen genau zu untersuchen, an denen sich das Design holprig anfühlt. Über die Jahre habe ich eine Liste von Signalen gesammelt, die mich in Legacy-Code auf implizite Konzepte hinweisen:

- **Ein Wort, das der Fachbereich benutzt, das der Code aber nicht kennt.** Wenn der Kundenservice „Rückgabefrist“ sagt und der Code `withinDeadline`, fehlt etwas.
- **Magic Numbers und Strings.** `14`, `status == 4`, `type == "B2B"`. Hinter jedem davon steckt eine Entscheidung, die jemand getroffen hat.
- **Kombinationen von Bedingungen.** `if (order.isGift && !order.isBusiness && order.country == "DE")` hat im Fachbereich meistens einen Namen. Der Code benutzt ihn nur nicht.
- **Kommentare, die erklären, was der Code bedeutet.** Ein Kommentar wie `// 4 = delivered` ist ein Konzept, das darum bittet, benannt zu werden.
- **Dieselbe Bedingung an mehreren Stellen.** Wenn du dieselbe Berechnung zweimal siehst, steckt ein Konzept dahinter.
- **Primitive Typen für fachliche Werte.** Datumswerte, Beträge und Kennungen, die als `LocalDateTime`, `Double` und `String` herumgereicht werden, während die Regeln, die zu ihnen gehören, über die Aufrufer verstreut sind.
- **Code, der für das, was er tut, seltsam kompliziert ist.** Lange Methoden mit mehreren Phasen, Flags, die das Verhalten umschalten, Sonderfälle, die sich auf Sonderfälle stapeln. Oft zwingt ein fehlendes Konzept den Code zu Umwegen.

Wenn ich mich durch ein Legacy-System arbeite, landet all das auf meiner Notizliste. Im Shop wies die Liste auf zwei fehlende Konzepte hin: den Bestellstatus und die Rückgabefrist.

## Von Magic Numbers zu Namen

Die einfachsten impliziten Konzepte brauchen nur einen Namen. Der Bestellstatus ist so eines:

```kotlin
enum class OrderStatus {
    PLACED,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED,
    RETURN_REQUESTED,
}
```

```kotlin
if (!order.isDelivered()) throw OrderNotDelivered(order.id)
```

Das ist eine kleine Änderung. Aber der nächste Entwickler muss nicht mehr wissen, dass 4 „geliefert“ bedeutet. Der Code sagt es.

## Von Arithmetik zu einem Konzept

Die Rückgabefrist braucht mehr als einen Namen. Sie hat eine Regel, und sie hat Verhalten: Sie endet an einem bestimmten Tag, und bis dahin ist eine Rückgabe erlaubt. Also wird sie zu einem Value Object:

```kotlin
data class ReturnPeriod(val endsOn: LocalDate) {
    fun allowsReturnOn(day: LocalDate): Boolean = day <= endsOn

    fun extendedTo(day: LocalDate): ReturnPeriod = ReturnPeriod(endsOn = maxOf(endsOn, day))
}
```

Wie die Rückgabefrist für eine Bestellung bestimmt wird, ist eine eigene Geschäftsregel. Sie bekommt ebenfalls ihren eigenen Ort:

```kotlin
interface ReturnPolicy {
    fun returnPeriodFor(orderedOn: LocalDate, deliveredOn: LocalDate): ReturnPeriod
}

class StandardReturnPolicy : ReturnPolicy {
    override fun returnPeriodFor(orderedOn: LocalDate, deliveredOn: LocalDate): ReturnPeriod =
        ReturnPeriod(endsOn = deliveredOn.plusDays(RETURN_DAYS))

    companion object {
        const val RETURN_DAYS = 14L
    }
}
```

Beachte das `LocalDate` statt `LocalDateTime`. Beim Schreiben der Charakterisierungstests hat der Entwickler herausgefunden, dass die alte Frist minutengenau war, und der Kundenservice hat bestätigt, dass der ganze Tag zählen soll. Ein Konzept explizit zu machen ist oft genau der Moment, in dem solche Fragen auftauchen und beantwortet werden.

Der Code, der es verwendet, liest sich jetzt so, wie der Fachbereich spricht:

```kotlin
val period = returnPolicy.returnPeriodFor(order.orderedOn, order.deliveredOn)
if (!period.allowsReturnOn(today)) throw ReturnPeriodExpired(period)
```

## Die Dezemberregel findet ihren Platz

Jetzt zurück zum Ticket. In der impliziten Version gab es nur einen Ort für die Dezemberregel: eine weitere Bedingung in `withinDeadline`. In der expliziten Version ist die Dezemberregel kein Sonderfall irgendeiner Arithmetik. Sie ist eine Variante der Rückgaberegelung:

```kotlin
class HolidayReturnPolicy(private val standardPolicy: ReturnPolicy) : ReturnPolicy {
    override fun returnPeriodFor(orderedOn: LocalDate, deliveredOn: LocalDate): ReturnPeriod {
        val standardPeriod = standardPolicy.returnPeriodFor(orderedOn, deliveredOn)
        if (orderedOn.month != Month.DECEMBER) return standardPeriod
        return standardPeriod.extendedTo(LocalDate.of(orderedOn.year + 1, 1, 31))
    }
}
```

Die Standardregelung hat sich nicht geändert. Das Value Object hat sich nicht geändert. Die neue Regel kommt neben die bestehenden, und ihre Absicht ergibt sich direkt aus ihrem Namen.

## Tests, die sich wie der Fachbereich lesen

```kotlin
@Test
fun `return period ends 14 days after delivery`() {
    val period = StandardReturnPolicy().returnPeriodFor(
        orderedOn = LocalDate.of(2026, 2, 26),
        deliveredOn = LocalDate.of(2026, 3, 1),
    )

    assertEquals(LocalDate.of(2026, 3, 15), period.endsOn)
}

@Test
fun `return is allowed on the last day of the return period`() {
    val period = ReturnPeriod(endsOn = LocalDate.of(2026, 3, 15))

    assertTrue(period.allowsReturnOn(LocalDate.of(2026, 3, 15)))
}

@Test
fun `december orders can be returned until january 31`() {
    val period = HolidayReturnPolicy(StandardReturnPolicy()).returnPeriodFor(
        orderedOn = LocalDate.of(2026, 12, 10),
        deliveredOn = LocalDate.of(2026, 12, 12),
    )

    assertEquals(LocalDate.of(2027, 1, 31), period.endsOn)
}

@Test
fun `holiday policy never shortens the standard return period`() {
    val period = HolidayReturnPolicy(StandardReturnPolicy()).returnPeriodFor(
        orderedOn = LocalDate.of(2026, 12, 30),
        deliveredOn = LocalDate.of(2027, 1, 25),
    )

    assertEquals(LocalDate.of(2027, 2, 8), period.endsOn)
}
```

Der letzte Test ist eine Frage, die der Entwickler mit dem alten Code nie gestellt hätte: Was passiert mit einer Dezemberbestellung, die erst spät im Januar geliefert wird? Mit einem expliziten Konzept liegt die Frage auf der Hand. Der Kundenservice hatte sofort eine Antwort: Der Kunde bekommt immer die Frist, die später endet.

Du könntest diese Testnamen der Leitung des Kundenservice zeigen, und sie würde sie verstehen. Das ist ein gutes Zeichen dafür, dass die Konzepte im Code zu den Konzepten des Fachbereichs passen.

## Wo es schwierig wird

**Den richtigen Namen finden.** Erfinde keine Namen. Hör den Leuten zu, die in der Domäne arbeiten, und benutze ihre Wörter. Wenn der Kundenservice „Rückgabefrist“ sagt, heißt die Klasse `ReturnPeriod` und nicht `DeadlineCalculator`. Wenn sie zwei verschiedene Wörter für dasselbe benutzen oder dasselbe Wort für zwei verschiedene Dinge, ist das ein Gespräch wert.

**Nicht jede Zahl ist ein Konzept.** Wer alles explizit macht, landet bei einer Codebasis voller winziger Klassen, nach denen niemand gefragt hat. Mein Test: Spricht der Fachbereich darüber? Würde es sich aus einem fachlichen Grund ändern? Wird es an mehr als einer Stelle verwendet? Wenn eine dieser Fragen mit Ja beantwortet wird, verdient es einen Namen.

**Umbenennen in einer Legacy-Codebasis macht Angst.** Ein Konzept einzuführen heißt oft, viele Stellen anzufassen. Hier zahlen sich die Tests aus dem :series-link[ersten Schritt]{slug="refactoring-legacy-code-without-fear"} aus. Führ das neue Konzept neben dem alten Code ein, zieh die Aufrufer einen nach dem anderen um und lösch die alte Version, wenn nichts sie mehr verwendet.

## Warum ich diesen Teil liebe

Von all der Arbeit, die nötig ist, um ein Legacy-System wartbar zu machen, ist das mein Lieblingsteil. Ein implizites Konzept zu finden fühlt sich an, als fände man das fehlende Puzzleteil. Plötzlich ergeben die seltsamen Umwege im Code einen Sinn: Sie alle haben um etwas herumgearbeitet, das keinen Namen hatte.

Dann kommt die Frage, wie sich dieses Konzept in der Struktur des Codes ausdrücken lässt. Ein Value Object? Eine Policy? Ein Zustand? Und dann der Moment, in dem ich den alten Code durch das neue Konzept ersetze und ein Knäuel aus Bedingungen zu ein paar Zeilen zusammenschrumpft, die sich wie ein Satz aus dem Fachbereich lesen.

Komplizierter Code wird einfach, schön und stabil. Nicht weil jemand besonders schlau war, sondern weil der Code endlich sagt, was er meint.
