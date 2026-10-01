---
title: "Eine Verantwortung pro Komponente"
excerpt: "Eine Komponente, die mehreren Abteilungen dient, hat mehrere Gründe, sich zu ändern – und jede Änderung für eine davon kann die anderen kaputt machen. Wie du erkennst, wann du aufteilen solltest, und wann das Aufteilen zu weit geht."
teaser: /assets/images/one-responsibility.jpg
tags: [single-responsibility-principle, software-architecture, refactoring, legacy-code, maintainability]
slug: eine-verantwortung-pro-komponente
---

Dieser Beitrag ist Teil der Serie :series-link[Die versteckten Kosten von nicht wartbarem Code]{slug="the-hidden-cost-of-unmaintainable-code"}. Ein neuer Entwickler soll in einem Onlineshop eine kleine Änderung umsetzen: „Im Dezember aufgegebene Bestellungen können bis zum 31. Januar zurückgegeben werden.“ In diesem Teil geht es um seinen ersten Versuch – und darum, was er dabei kaputt gemacht hat.

Der Entwickler hat die Methode gefunden, die entscheidet, ob eine Rückgabe noch erlaubt ist. Die Änderung sieht einfach aus:

```kotlin
private fun withinDeadline(order: Order): Boolean {
    if (order.orderedAt.monthValue == 12) {
        return LocalDateTime.now() <= LocalDateTime.of(order.orderedAt.year + 1, 1, 31, 23, 59)
    }
    return order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
}
```

Die Tests für Rückgaben laufen durch. Die Änderung wird reviewt, gemergt und deployt.

Am nächsten Morgen fragt jemand aus der Buchhaltung, warum für Dezember-Bestellungen keine Zahlungserinnerungen verschickt wurden. Kunden, die im Dezember auf Rechnung gekauft und nie bezahlt haben, bekommen vor Februar keine Erinnerung.

## Die gemeinsame Hilfsmethode

Der Entwickler sucht nach `withinDeadline` und findet einen zweiten Aufrufer, in derselben Klasse:

```kotlin
fun sendPaymentReminders() {
    val orders = jdbc.query(
        "SELECT * FROM orders WHERE payment_method = 'invoice' AND paid_at IS NULL AND status = 4",
        OrderRowMapper(),
    )
    for (order in orders) {
        if (!withinDeadline(order)) {
            mailer.send(order.customerEmail, "Payment reminder", renderReminder(order))
        }
    }
}
```

Kunden, die auf Rechnung kaufen, müssen innerhalb von 14 Tagen nach Lieferung bezahlen. Irgendwer hat gemerkt, dass `withinDeadline` schon „14 Tage nach Lieferung“ berechnet, und die Methode wiederverwendet. Das hat jahrelang funktioniert. Bis sich die Rückgabefrist geändert und das Zahlungsziel mitgenommen hat.

Zwei Geschäftsregeln. Eine vom Kundenservice festgelegt, eine von der Buchhaltung. Sie haben sich eine Implementierung geteilt, weil sie zufällig dieselbe Zahl hatten und zufällig in derselben Klasse lebten.

## Zu viele Herren

Die gemeinsame Hilfsmethode ist nur das Symptom. Das eigentliche Problem ist die Klasse, in der sie lebt. `OrderService` macht all das:

- `calculateTotal` – Preise und Rabatte, geändert, sobald das Marketing eine Kampagne startet
- `requestReturn` – der Rückgabeprozess, verantwortet vom Kundenservice
- `createInvoice` und `sendPaymentReminders` – Rechnungsstellung und Mahnwesen, verantwortet von der Buchhaltung
- `sendConfirmation` – die Bestellbestätigung per E-Mail, formuliert vom Marketing

Vier Verantwortungen, drei Abteilungen, eine Klasse. Jede davon kann jederzeit eine Änderung verlangen, aus ihren eigenen Gründen. Und innerhalb einer Klasse ist Teilen einfach und unsichtbar. Hier eine private Hilfsmethode, da eine gemeinsame Variable. Niemand hat entschieden, die Rückgabefrist an das Zahlungsziel zu koppeln. Es ist einfach passiert, weil es bequem war.

Robert C. Martin beschreibt das Single Responsibility Principle in *Clean Architecture* so: „Ein Modul sollte für einen, und nur einen, Akteur verantwortlich sein.“ Das finde ich viel hilfreicher als „eine Klasse sollte nur eine Sache tun“, denn „eine Sache“ kann alles bedeuten. Die Frage „Wer wird mich bitten, das zu ändern?“ hat eine konkrete Antwort.

Für `OrderService` lautet die Antwort: Marketing, Kundenservice und Buchhaltung. Das sind drei Gründe für Änderungen, und jede Änderung für einen von ihnen riskiert, etwas für die anderen kaputt zu machen. Genau das ist mit der Dezember-Regel passiert.

## Was das kostet

Eine Komponente mit mehreren Verantwortungen ist auf eine Weise teuer, die man leicht übersieht:

- **Änderungen haben Nebenwirkungen in Features, die nichts damit zu tun haben.** Der Dezember-Bug ist das offensichtliche Beispiel. Die weniger offensichtlichen sind die Bugs, die noch niemand bemerkt hat.
- **Wer ein Feature verstehen will, muss alle verstehen.** Um den Rückgabeprozess sicher zu ändern, muss der Entwickler auch den Code für die Rechnungsstellung lesen. Das ist kognitive Last, die nichts mit seiner Aufgabe zu tun hat.
- **Tests brauchen riesige Setups.** Wer eine Methode einer Klasse mit vier Verantwortungen testen will, muss die Abhängigkeiten aller vier bedienen.
- **Teams kommen sich gegenseitig in die Quere.** Zwei Features für zwei Abteilungen fassen dieselbe Datei an. Merge-Konflikte, abgestimmte Releases, Warten.

## Entlang der Akteure aufteilen

Das Refactoring folgt den Akteuren. Die Regeln jeder Abteilung bekommen ihr eigenes Zuhause, und das Zahlungsziel wird zu einem eigenen Konzept, :series-link[explizit]{slug="making-implicit-concepts-explicit"} und unabhängig von der Rückgabefrist:

```kotlin
data class PaymentTerm(val dueOn: LocalDate) {
    fun isOverdueOn(day: LocalDate): Boolean = day > dueOn
}

class InvoicePaymentTerms {
    fun paymentTermFor(deliveredOn: LocalDate): PaymentTerm =
        PaymentTerm(dueOn = deliveredOn.plusDays(PAYMENT_DAYS))

    companion object {
        const val PAYMENT_DAYS = 14L
    }
}
```

Das Versenden von Erinnerungen wird zu einem Use Case, der nur kennt, was er braucht:

```kotlin
data class UnpaidInvoice(val orderId: Long, val customerEmail: String, val deliveredOn: LocalDate)

class SendPaymentReminders(
    private val orders: OrderRepository,
    private val paymentTerms: InvoicePaymentTerms,
    private val clock: Clock,
    private val notifications: CustomerNotifications,
) {
    fun execute() {
        val today = clock.today()
        for (invoice in orders.unpaidInvoices()) {
            if (paymentTerms.paymentTermFor(invoice.deliveredOn).isOverdueOn(today)) {
                notifications.paymentOverdue(invoice)
            }
        }
    }
}
```

Der Rückgabeprozess bekommt dieselbe Behandlung mit `ReturnPeriod`, den Rückgaberegelungen und einem Use Case `RequestReturn`. Preisberechnung und Bestätigungs-E-Mail ziehen ebenfalls aus. Was am Ende von `OrderService` übrig bleibt, ist nichts. Die Klasse wird gelöscht.

Jetzt können sich die beiden Regeln unabhängig voneinander ändern. Und es gibt einen Test, der dafür sorgt, dass das so bleibt:

```kotlin
@Test
fun `december orders are reminded 14 days after delivery`() {
    val term = InvoicePaymentTerms().paymentTermFor(deliveredOn = LocalDate.of(2026, 12, 12))

    assertEquals(LocalDate.of(2026, 12, 26), term.dueOn)
}
```

Dieser Test hätte den Bug gefunden, bevor er in Produktion gelandet wäre. Und er dokumentiert etwas, das vorher nie aufgeschrieben wurde: Die Rückgaberegel für Dezember hat nichts damit zu tun, wann Kunden bezahlen müssen.

## Woran du eine Komponente mit zu vielen Verantwortungen erkennst

Ein paar Fragen, die ich mir stelle, wenn ich mich durch eine Legacy-Codebasis arbeite:

- **Wer verlangt Änderungen an dieser Komponente?** Wenn die Antwort mehr als eine Abteilung, Rolle oder ein Team ist, ist sie ein Kandidat zum Aufteilen.
- **Kann ich beschreiben, was sie tut, ohne „und“ zu sagen?** „Sie berechnet Preise und wickelt Rückgaben ab und erstellt Rechnungen“ sind drei Komponenten.
- **Dienen private Hilfsmethoden öffentlichen Methoden, die nichts miteinander zu tun haben?** Dort versteckt sich unbeabsichtigte Kopplung.
- **Muss ich zum Testen eines Verhaltens Abhängigkeiten für ein anderes aufsetzen?** Das Test-Setup verrät oft mehr über die Struktur als der Code.
- **Kollidieren Features, die nichts miteinander zu tun haben, immer wieder in derselben Datei?** Merge-Konflikte sind ein strukturelles Signal.

## Wenn das Aufteilen zu weit geht

Zu all dem gibt es ein Gegengewicht, und es ist wichtig. Aufteilen kann zu weit gehen.

Ich habe Codebasen gesehen, in denen jede Klasse genau eine Methode hat: ein `ReturnPeriodCalculator`, ein `ReturnPeriodValidator`, ein `ReturnPeriodFormatter`, eine `ReturnPeriodCalculatorFactory`. Jede einzelne ist trivial. Zu verstehen, wie sie zusammenspielen, ist es nicht. Die kognitive Last ist nicht verschwunden. Sie ist aus den Klassen in die Verdrahtung zwischen ihnen gewandert.

John Ousterhout beschreibt das in *A Philosophy of Software Design* als Unterschied zwischen flachen und tiefen Modulen. Ein tiefes Modul versteckt viel Komplexität hinter einer einfachen Schnittstelle. Ein flaches Modul hat eine Schnittstelle, die fast so komplex ist wie das, was es tut. Viele flache Module machen ein System schwerer verständlich, nicht leichter.

Deshalb teile ich entlang der Akteure und der Gründe für Änderungen auf, nicht entlang von Verben oder Codezeilen. `ReturnPeriod` weiß, wann sie endet und ob eine Rückgabe an einem bestimmten Tag erlaubt ist. Beides gehört zusammen, weil es sich gemeinsam ändert, für dieselben Leute. Es auseinanderzureißen, würde eine Klasse hinzufügen und nichts wegnehmen.

## Wo es schwierig wird

**Eine große Klasse aufteilen, ohne sie kaputt zu machen.** Ich mache das nie in einem Schritt. Ich ziehe eine Verantwortung nach der anderen heraus, lasse die alte Klasse an die neue delegieren und stelle die Aufrufer um, wenn die Tests grün sind. Die :series-link[Charakterisierungstests]{slug="refactoring-legacy-code-without-fear"} aus dem ersten Schritt machen das möglich.

**Gemeinsame Daten.** Die Methoden lassen sich leicht aufteilen. Die Daten sind schwieriger. Jede Abteilung nutzt die `Order`, und sie wächst gern zu einer Klasse heran, die alles über jeden weiß. Manchmal ist die richtige Antwort, zu akzeptieren, dass Buchhaltung und Kundenservice leicht unterschiedliche Dinge meinen, wenn sie „Bestellung“ sagen – und jedem sein eigenes Modell zu geben. Das ist ein Thema für einen anderen Beitrag.

**Die Akteure kennen.** Du kannst nur entlang der Akteure aufteilen, wenn du weißt, wer sie sind. Das kannst du nicht aus dem Code lesen. Das erfährst du, wenn du mit den Leuten sprichst, die das System benutzen.

## Ein einziger Herr

Wenn eine Komponente nur einem Akteur gegenüber verantwortlich ist, bleibt eine Änderung für diesen Akteur dort, wo sie hingehört. Der Entwickler, der die nächste Rückgaberegel umsetzt, muss nicht wissen, wie die Rechnungsstellung funktioniert. Er muss keine Angst haben, die Zahlungserinnerungen kaputt zu machen. Die Struktur des Codes macht das unmöglich.

Das ist das Ziel: Komponenten, die so fokussiert sind, dass eine Änderung für einen Teil des Unternehmens einen anderen nicht überraschen kann.
