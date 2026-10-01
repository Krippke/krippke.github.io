---
title: "Legacy-Code ohne Angst refactoren"
excerpt: "Ohne Tests musst du langsam und vorsichtig gehen. Mit Tests kannst du rennen. Wie du ein Sicherheitsnetz in ein Legacy-System bekommst, das keins hat – und warum die ersten Tests falsch sein dürfen."
teaser: /assets/images/without-fear.jpg
tags: [legacy-code, refactoring, testing, characterization-tests, maintainability]
slug: legacy-code-ohne-angst-refactoren
---

Dieser Beitrag ist Teil der Serie :series-link[Die versteckten Kosten von nicht wartbarem Code]{slug="the-hidden-cost-of-unmaintainable-code"}. Die Serie begleitet einen neuen Entwickler bei einer kleinen Änderung in einem Onlineshop: „Bestellungen aus dem Dezember können bis zum 31. Januar zurückgegeben werden.“ In diesem Teil geht es um das Erste, was er tut, bevor er überhaupt Feature-Code anfasst.

Der Entwickler öffnet `OrderService`. Die Klasse ist 1.400 Zeilen lang. Sie berechnet Summen, wickelt Rückgaben ab, erstellt Rechnungen, verschickt Zahlungserinnerungen und Bestätigungsmails. Es gibt einen `tests`-Ordner. Darin liegt eine Datei, zuletzt vor vier Jahren geändert, und sie wird übersprungen.

Im Ticket steht eine Stunde. Das Bauchgefühl des Entwicklers sagt: Wenn ich hier etwas ändere, habe ich keine Ahnung, was ich sonst noch kaputt mache.

Dieses Bauchgefühl hat recht. Und es ist das teuerste Gefühl in der Softwareentwicklung.

## Im Dunkeln laufen

Ohne Tests ist jede Änderung an einem Legacy-System ein Gang im Dunkeln. Du bewegst dich langsam. Du liest jede Zeile zweimal. Nach jeder Änderung klickst du dich von Hand durch die Anwendung und hoffst, dass du die richtigen Dinge getestet hast. Du deployst und beobachtest die Logs.

Und trotzdem geht etwas kaputt. Nicht, weil der Entwickler unachtsam ist, sondern weil niemand das ganze System im Kopf behalten kann. Die Seiteneffekte sind da, man sieht sie nur nicht.

Die Kosten sind nicht nur die Bugs. Es ist die Langsamkeit. Jede Änderung dauert länger als nötig, weil jede Änderung mit maximaler Vorsicht gemacht werden muss. Multipliziere das mit jedem Entwickler und jeder Änderung über Jahre, und du hast einen der größten versteckten Kostenfaktoren von Legacy-Code.

Tests ändern das. Ich stelle es mir so vor: Ohne Tests musst du langsam und vorsichtig gehen. Mit Tests kannst du rennen – weil du in dem Moment Bescheid bekommst, in dem du etwas kaputt machst.

## Tests sind die Definition des Verhaltens

Darüber habe ich schon in :series-link[Die Rolle von Tests]{slug="the-role-of-tests"} geschrieben: Für mich sind Tests kein Prüfschritt am Ende. Sie sind die Definition dessen, was das System tun soll.

In einem Legacy-System gibt es diese Definition nicht. Das Verhalten gibt es, irgendwo in 1.400 Zeilen, aber niemand hat aufgeschrieben, wie es sein soll. Das erste Ziel ist also nicht, irgendetwas zu verbessern. Das erste Ziel ist, das bestehende Verhalten in Tests zu überführen, mit so wenigen Änderungen am Code wie möglich.

Michael Feathers nennt das in _Working Effectively with Legacy Code_ _Charakterisierungstests_. Du schreibst nicht auf, was der Code tun sollte. Du schreibst auf, was er tatsächlich tut.

## Jede Definition ist besser als keine Definition

Jetzt kommt der Teil, der viele überrascht: Die ersten Tests dürfen falsch sein.

Wenn ich ein Legacy-System übernehme, kenne ich die Fachlichkeit noch nicht. Ich schreibe Tests auf Basis dessen, was der Code tut und was ich glaube, dass es bedeutet. Einige dieser Definitionen werden falsch sein. Das ist in Ordnung. Sie werden in den nächsten Iterationen in Gesprächen mit Fachexperten und Stakeholdern korrigiert.

Entscheidend ist, dass das Verhalten als automatisierter Test aufgeschrieben ist. Eine falsche Definition, die aufgeschrieben ist, kann man diskutieren und korrigieren. Eine richtige Definition, die nur in jemandes Kopf existiert, kann niemand überprüfen.

## Das erste Hindernis: Du kannst es nicht testen

Das ist die Rückgabelogik, die der Entwickler findet:

```kotlin
@Service
class OrderService(
    private val jdbc: JdbcTemplate,
    private val mailer: Mailer,
    private val pdfRenderer: PdfRenderer,
) {
    fun requestReturn(orderId: Long) {
        val order = jdbc.queryForObject("SELECT * FROM orders WHERE id = ?", OrderRowMapper(), orderId)
        if (order.status != 4) throw IllegalStateException("Order not delivered")
        if (!withinDeadline(order)) throw IllegalStateException("Too late")
        jdbc.update("UPDATE orders SET status = 7 WHERE id = ?", orderId)
        mailer.send(order.customerEmail, "Your return", renderReturnLabel(order))
    }

    private fun withinDeadline(order: Order) =
        order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
}
```

Um einen einzigen Test für „eine Bestellung kann an Tag 14 zurückgegeben werden“ zu schreiben, braucht der Entwickler eine Datenbank mit einer Bestellzeile, einen Mailer, der keine echten Mails verschickt, einen PDF-Renderer und Kontrolle über die aktuelle Uhrzeit.

An diesem Punkt wäge ich ständig zwei Dinge gegeneinander ab: Wie stark verändere ich die Struktur des Codes, und wie komplex darf mein Test-Setup werden?

Der verlockende Weg ist, den Code so zu lassen, wie er ist, und das Setup zu bauen: eine Testdatenbank, ein gemockter Mailer, ein statischer Mock, der `LocalDateTime.now()` einfriert. Das funktioniert. Aber die Tests hängen jetzt an jedem Detail der aktuellen Struktur. Jedes spätere Refactoring macht sie kaputt. Und das Setup verdeckt das eigentliche Problem: Dieser Code hat zu viele Abhängigkeiten.

Hier gehe ich selten Kompromisse ein. Kompromisse rächen sich früher, als man denkt.

## Erst kleine, sichere Schritte

Refactoring ohne Tests ist riskant. Die ersten Refactorings müssen deshalb klein und mechanisch sein und am besten von der IDE erledigt werden: eine Funktion extrahieren, einen Parameter einführen, eine Abfrage hinter eine Methode verschieben. Änderungen, bei denen sich das Verhalten nicht versehentlich ändern kann.

Der erste Schritt ist, die Entscheidung aus dem Service herauszuziehen, in eine Funktion, die nur von ihren Eingaben abhängt:

```kotlin
fun withinReturnDeadline(order: Order, now: LocalDateTime): Boolean =
    order.deliveredAt!!.plusDays(14) >= now
```

Der zweite Schritt ist, die Uhr nicht mehr innerhalb des Service abzufragen. Der Service bekommt eine `Clock` übergeben, und der Produktivcode verwendet eine `SystemClock`:

```kotlin
@Service
class OrderService(
    private val jdbc: JdbcTemplate,
    private val mailer: Mailer,
    private val pdfRenderer: PdfRenderer,
    private val clock: Clock,
) {
    fun requestReturn(orderId: Long) {
        ...
        if (!withinReturnDeadline(order, clock.now())) throw IllegalStateException("Too late")
        ...
    }
}
```

Am Verhalten hat sich nichts geändert. Aber die Regel lässt sich jetzt ohne Datenbank, ohne Mailer und ohne eingefrorene Systemuhr testen.

## Tests, die dir etwas sagen

```kotlin
@Test
fun `order can be returned 14 days after delivery`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertTrue(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 15, 15, 59)))
}

@Test
fun `order cannot be returned 15 days after delivery`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertFalse(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 16, 9, 0)))
}

@Test
fun `return deadline ends at the exact delivery time on day 14`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertFalse(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 15, 16, 1)))
}
```

Der dritte Test ist der interessante. Beim Schreiben hat der Entwickler gemerkt, dass die Frist minutengenau ist: Ein Kunde, dessen Paket um 16 Uhr angekommen ist, kann es zwei Wochen später bis 16 Uhr zurückgeben, aber nicht mehr um 16:01 Uhr. Ist das so gewollt? Wahrscheinlich nicht. Aber das System macht es heute so, also wird daraus ein Test mit einem ehrlichen Namen.

Dieser Test ist eine Frage, geschrieben als Code. Der Entwickler geht damit zum Kundenservice. Die Antwort: Natürlich zählt der ganze Tag. Der Test wird umbenannt und angepasst, der Code zieht nach. Die Definition war falsch, sie wurde korrigiert, und jetzt ist sie richtig und aufgeschrieben.

So werden aus Charakterisierungstests mit der Zeit Spezifikationen.

## Erst trennen, dann ersetzen

Für die Orchestrierung in `requestReturn` – Bestellung laden, Regel prüfen, Status aktualisieren, Mail verschicken – muss der Entwickler in den Tests immer noch die Datenbank und den Mailer ersetzen.

Rohe SQL-Aufrufe zu faken ist mühsam und fragil. Statt also das `JdbcTemplate` zu mocken, verschiebe ich die Abfragen hinter ein `OrderRepository` mit `get` und `save` und den Mailversand hinter einen `CustomerNotifications`-Port. Für beide gibt es einfache In-Memory-Implementierungen für die Tests. Der Service weiß danach überhaupt nichts mehr von SQL und SMTP.

Hier fangen Testabdeckung und Struktur an, sich gegenseitig zu verstärken. Der Aufwand, den Code testbar zu machen, ist derselbe Aufwand, der ihm eine klare Domäne gibt, eine Application-Schicht, die orchestriert, eine Persistenzschicht, die nur Zustand speichert und wiederherstellt, und eine Humble UI. Die Details stehen in :series-link[Verantwortung in der richtigen Schicht]{slug="responsibilities-in-the-right-layer"}.

## Die Notizliste

Charakterisierungstests zu schreiben zwingt dich, jeden Zweig des Codes genau zu lesen. Genau so verstehst du ein Legacy-System. Und währenddessen führe ich eine Liste mit allem, was nicht in mein Bild passt.

Beim Entwickler im Shop sah die Liste nach zwei Tagen so aus:

```
- "deadline" in withinDeadline means return period. The concept has no name.
- Return period is also computed in the frontend (from order date!) and in the customer service report (UTC).
- Confirmation email hard-codes "within 14 days".
- withinDeadline is also used for payment reminders. Same number, different rule?
- status == 4 means delivered, status == 7 means return requested. No enum.
- Return deadline precise to the minute. Confirmed: should be whole days.
```

Jede Zeile auf dieser Liste ist ein Symptom für ein strukturelles Problem. Oder anders gesagt: für ein Konzept, das extrem kompliziert umgesetzt wurde. Die Liste wird zum Backlog für das eigentliche Refactoring, und jeder Eintrag führt zu einem der Prinzipien dieser Serie:

- Ein Konzept ohne Namen → :series-link[Implizite Konzepte explizit machen]{slug="making-implicit-concepts-explicit"}
- Dieselbe Entscheidung an mehreren Stellen → :series-link[Eine Entscheidung, ein Ort]{slug="one-decision-one-place"}
- Eine Funktion, die zwei Abteilungen bedient → :series-link[Eine Verantwortung pro Komponente]{slug="one-responsibility-per-component"}
- Geschäftsregeln in SQL und im Frontend → :series-link[Verantwortung in der richtigen Schicht]{slug="responsibilities-in-the-right-layer"}

## Wo es schwierig wird

**Du kannst nicht immer klein anfangen.** Mancher Code ist so verstrickt, dass sich schon das Extrahieren einer Funktion gefährlich anfühlt. Dann fange ich mit einem groben Sicherheitsnetz an der äußersten Grenze an: Ich zeichne die Antworten des bestehenden Systems für eine Reihe echter Eingaben auf und vergleiche nach jeder Änderung dagegen. Das nennt sich _Approval Testing_ oder _Golden Master Testing_. Es ist keine Spezifikation, aber es ist ein Netz, und es kann wieder weg, sobald die feineren Tests da sind.

**Charakterisierungstests schreiben Bugs fest.** Sie halten fest, was das System tut, auch das, was es falsch macht. Das ist so gewollt. Benenne diese Tests ehrlich, markiere sie als Fragen und bring sie zu den Leuten, die es wissen. Der Bug ist jetzt sichtbar statt versteckt.

**Am Anfang fühlt es sich langsam an.** Die ersten Tage bringen Tests und kleine Refactorings hervor, aber keine Features. Das ist die Investition. Sie zahlt sich zum ersten Mal aus, wenn eine Änderung, die Tage gedauert hätte, eine Stunde dauert und die Tests dir sagen, dass du sicher deployen kannst.

## Fang an zu rennen

Falschliegen gehört zum Prozess. Darüber habe ich in :series-link[Warum du immer falschliegen musst]{slug="why-you-always-need-to-be-wrong"} geschrieben. Es geht nicht darum, Fehler zu vermeiden, sondern sie sofort zu bemerken.

Genau das gibt dir ein Sicherheitsnetz in einem Legacy-System. Keine Gewissheit, aber Feedback. Die ersten Tests sind vielleicht falsch. Die ersten Refactorings sind vielleicht winzig. Aber ab dem Moment, in dem das Verhalten aufgeschrieben ist, musst du nicht mehr auf Zehenspitzen durch den Code schleichen.

Du kannst anfangen zu rennen.
