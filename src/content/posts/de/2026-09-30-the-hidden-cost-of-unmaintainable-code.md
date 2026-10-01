---
title: "Die versteckten Kosten von nicht wartbarem Code"
excerpt: "Nicht wartbarer Code scheitert nicht laut. Er macht jede Änderung langsamer, riskanter und beängstigender. Was er wirklich kostet und wie aus Legacy-Code wieder einfacher, langweiliger Code wird."
date: 2026-09-30 18:00:00 +0200
updated: 2026-09-30T18:00:00+02:00
teaser: /assets/images/hidden-cost.jpg
tags: [software-architecture, legacy-code, refactoring, maintainability, clean-code]
slug: die-versteckten-kosten-von-nicht-wartbarem-code
---

Montagmorgen. Ein Entwickler, der vor drei Wochen ins Team gekommen ist, nimmt sich ein Ticket aus dem Backlog: „Bestellungen aus dem Dezember können bis zum 31. Januar zurückgegeben werden.“ Der Product Owner hat es auf eine Stunde geschätzt. Eine kleine Änderung. Ein Datum, eine Bedingung, fertig vor dem Mittagessen.

Drei Tage später ist die Änderung immer noch nicht deployt. Der Entwickler hat vier Stellen in der Codebasis gefunden, die sich mit der Rückgabefrist beschäftigen. Sie widersprechen sich. Niemand im Team kann sagen, welche richtig ist. Und der erste Versuch, die Änderung umzusetzen, hat die Zahlungserinnerungen für alle Dezember-Bestellungen kaputt gemacht.

Nichts an dieser Geschichte ist ungewöhnlich. Ich habe sie in fast jedem Legacy-System erlebt, das ich übernommen habe. Die Änderung selbst war trivial. Der Code drumherum war es nicht.

## Die Kosten, die auf keiner Rechnung stehen

Nicht wartbarer Code scheitert selten laut. Er stürzt nicht am ersten Tag ab. Er macht nur jede Änderung ein bisschen langsamer, ein bisschen riskanter und ein bisschen beängstigender als die davor. Die Kosten sind real, aber sie tauchen nie als eigener Posten auf. Sie zeigen sich als Angst.

**Angst vor dem Deployment in Produktion.** Auf jedes Release folgt die Frage: Was haben wir diesmal kaputt gemacht? Teams reagieren darauf, indem sie seltener releasen, mehr Änderungen in jedes Release packen und manuelle Testphasen einführen. Und das macht jedes Release noch riskanter.

**Angst vor Updates von Abhängigkeiten.** Ein Framework oder eine Bibliothek zu aktualisieren heißt, Code anzufassen, den niemand ganz versteht. Also wird das Update verschoben. Und wieder verschoben. Sicherheitspatches stapeln sich, und irgendwann ist das Update keine Aufgabe mehr, sondern ein Projekt.

**Angst vor Produktionsvorfällen.** Wenn etwas schiefgeht, weiß niemand, wo er suchen soll. Die Ursache könnte überall liegen. Ich habe Bugs gesehen, bei denen die Suche nach der Ursache Wochen gedauert hat und die Behebung zehn Minuten.

Hinter diesen Ängsten stecken Kosten, die schwerer zu sehen sind:

- **Schätzungen werden unzuverlässig.** Wenn niemand weiß, was eine Änderung alles berührt, ist jede Schätzung geraten. Das Vertrauen zwischen Entwicklung und Fachbereich bröckelt, und die Antwort darauf ist meist mehr Kontrolle, mehr Meetings und mehr Puffer.
- **Wissen konzentriert sich in wenigen Köpfen.** Nur ein oder zwei Leute verstehen bestimmte Teile des Systems. Sie werden zum Engpass – und zum Risiko, wenn sie krank sind oder gehen.
- **Das Onboarding dauert Monate statt Wochen.** Ein neuer Entwickler kann kein System lernen, das sich nicht selbst erklärt. Er muss es von Menschen lernen.
- **Gute Entwickler gehen.** In einer Codebasis zu arbeiten, in der jede Änderung ein Kampf ist, ist anstrengend. Wer Angebote hat, nimmt sie an.
- **Die Kosten summieren sich.** Jede Abkürzung macht die nächste Änderung teurer. Irgendwann sind die Zinsen so hoch, dass keine Kapazität mehr bleibt, um die Schulden abzuzahlen.

Nichts davon ist in einem Sprint-Report zu sehen. Alles davon sieht man daran, wie ein Team über seinen eigenen Code denkt.

## Wo ich anfange

Ich habe über die Jahre viele Legacy-Systeme übernommen und sie in Codebasen verwandelt, in denen Teams wieder gerne arbeiten. Der Ablauf ist immer derselbe, und er beginnt nicht mit Code.

Der erste Schritt ist Verstehen. Welches Problem löst dieses System? Welchen Wert soll es schaffen? Wie erreicht es dieses Ziel, mit welchen Konzepten? Welche Akteure bewegen sich durch das System, und wofür ist jeder von ihnen verantwortlich?

Hätten diese Systeme Tests, wäre das oft eine leichte Aufgabe. Tests beschreiben, wie sich das System verhalten soll. Aber in keinem Legacy-System, an dem ich gearbeitet habe, konnte man ernsthaft von Testabdeckung sprechen. Also besteht der zweite Schritt darin, das bestehende Verhalten in Tests zu gießen, mit so wenigen Änderungen am Code wie möglich.

Dabei passieren die ersten Refactorings. Eine Komponente mit vielen Abhängigkeiten braucht ein riesiges Test-Setup. Also wäge ich ständig zwei Dinge gegeneinander ab: Wie stark ändere ich die Struktur des Codes, und wie komplex darf mein Test-Setup werden? Kompromisse mache ich hier selten. Kompromisse rächen sich früher, als man denkt. In der Praxis heißt das: eine klare Domäne ohne technische Details einführen, eine Anwendungsschicht, die die Akteure der Domäne orchestriert, eine Persistenzschicht, deren einzige Aufgabe es ist, Zustand zu speichern und wiederherzustellen, und eine Humble UI, sauber vom Rest getrennt.

Während ich auf die Testabdeckung hinarbeite, baue ich mein Verständnis der Codebasis auf. Ich lerne ihre Konzepte kennen. Ich finde implizite Konzepte und schreibe sie auf, um sie später explizit zu machen. Ich finde Entscheidungen, die an mehreren Stellen getroffen werden. Alles, was nicht ganz ins Bild passt, aber irgendwie trotzdem funktioniert, kommt auf die Liste. Diese Notizen sind oft Hinweise auf ein strukturelles Problem. Oder anders gesagt: auf ein Konzept, das extrem kompliziert umgesetzt wurde.

Dann refactore ich, eine Notiz nach der anderen. Das Ziel ist einfacher, langweiliger Code, der tut, was er soll.

## Der Entwickler ist der Kunde des Codes

Hinter all dem steht eine Idee. Normalerweise denken wir bei den Kunden unserer Software an die Nutzer. Aber auch der Code selbst hat einen Kunden: den Entwickler, der ihn als Nächstes ändern muss.

Alles, was ein Entwickler bei einer Änderung im Kopf behalten muss, ist kognitive Last. Implizite Regeln, Stellen, die sich gemeinsam ändern müssen, Seiteneffekte in Features, die nichts miteinander zu tun haben, die Frage, wo man überhaupt suchen soll. Je mehr von dieser Last der Code dem Entwickler aufbürdet, desto langsamer und riskanter wird jede Änderung. Nicht weil der Entwickler schlecht ist, sondern weil das menschliche Arbeitsgedächtnis begrenzt ist.

Wartbarer Code nimmt diese Last weg. Er erklärt sich selbst, er hat für jede Entscheidung genau einen Ort, und er hat Tests, die dir sofort sagen, wenn du etwas kaputt gemacht hast. Dem Entwickler die Arbeit leicht zu machen ist kein Luxus. Genau daher kommt Effizienz.

Gehen wir zurück zu dem Entwickler und dem Dezember-Ticket und schauen wir uns an, worauf er gestoßen ist.

## Schritt 1: Zuerst das Verhalten festnageln

Der Entwickler fängt nicht damit an, Code zu ändern. Er fängt damit an, einen Test für das aktuelle Verhalten zu schreiben: Eine Bestellung, die am 1. März geliefert wurde, kann am 15. März zurückgegeben werden, aber nicht am 16. März.

Selbst das ist schwieriger als gedacht. Die Rückgabelogik steckt in einem `OrderService`, der direkt mit der Datenbank, dem Mailserver und einem PDF-Renderer spricht und die aktuelle Zeit mit `LocalDateTime.now()` liest. Um eine Regel zu testen, muss man das halbe System aufbauen. Also passieren die ersten kleinen Refactorings, bevor überhaupt an einem Feature gearbeitet wird: Die Uhr wird hineingereicht statt ausgelesen, die Regel wird aus dem Datenbankaufruf herausgelöst.

Der erste Test kann sogar falsches Verhalten festschreiben. Das ist in Ordnung. Jede Definition ist besser als keine Definition. Sie wird in Gesprächen mit den Leuten korrigiert, die das Geschäft kennen. Wichtig ist, dass das Verhalten als automatisierter Test aufgeschrieben ist. Ohne Tests musst du langsam und vorsichtig gehen. Mit Tests kannst du rennen, weil du in dem Moment Bescheid bekommst, in dem du etwas kaputt machst.

Vertiefung: :series-link[Legacy-Code ohne Angst refactoren]{slug="refactoring-legacy-code-without-fear"}

## Schritt 2: Das Konzept, das es nicht gibt

Der Entwickler durchsucht die Codebasis nach „Rückgabefrist“. Nichts. Das Konzept, über das der Fachbereich jeden Tag spricht, existiert im Code nicht. Was existiert, ist das hier:

```kotlin
private fun withinDeadline(order: Order) =
    order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
```

Jemand musste wissen, dass „Deadline“ hier die Rückgabefrist meint und dass `14` eine geschäftliche Entscheidung ist und keine technische Konstante. Dieses Wissen steckte im Kopf des ursprünglichen Autors. Es ist weg.

Wenn ein Konzept implizit ist, muss jeder Entwickler es aus Arithmetik rekonstruieren. Wenn es explizit ist – eine `ReturnPeriod` mit einem Namen, einem Ort und einer klaren Regel –, lässt sich der Code in der Sprache des Fachbereichs lesen, und die Dezember-Regel hat einen offensichtlichen Platz.

Vertiefung: :series-link[Implizite Konzepte explizit machen]{slug="making-implicit-concepts-explicit"}

## Schritt 3: Vier Stellen, drei Antworten

Beim Schreiben der Tests findet der Entwickler die Rückgabefrist an vier Stellen:

1. Das Backend zählt 14 Tage ab Lieferung, in Serverzeit.
2. Das Frontend zählt 14 Tage ab Bestelldatum.
3. Ein SQL-Report für den Kundenservice zählt zwei Wochen ab Lieferung, in UTC.
4. Die Bestellbestätigung per E-Mail sagt „innerhalb von 14 Tagen“, fest einprogrammiert.

Keine davon war falsch, als sie geschrieben wurde. Jede war eine vernünftige Auslegung einer Regel, die nie an einer Stelle aufgeschrieben wurde. Aber sie sind auseinandergedriftet, und der Kunde sieht im Shop „rückgabefähig“, während das Backend die Rückgabe ablehnt.

Dazu führen implizite Konzepte. Dieselbe Entscheidung wird an mehreren Stellen getroffen, und mehrere Kopien einer Entscheidung driften auseinander. Die Frage ist nicht, ob, sondern wann. Die Dezember-Änderung hat diesen Bug nicht verursacht. Sie hat ihn nur sichtbar gemacht.

Die Lösung ist nicht, vier Stellen anzupassen. Die Lösung ist, die Entscheidung einmal zu treffen und alles andere nach dem Ergebnis fragen zu lassen.

Vertiefung: :series-link[Eine Entscheidung, ein Ort]{slug="one-decision-one-place"}

## Schritt 4: Die Änderung, die die Rechnungen kaputt machte

Der erste Versuch des Entwicklers war der naheliegende: die Dezember-Regel in `withinDeadline` einbauen. Die Rückgabetests liefen durch. Am nächsten Morgen meldete die Buchhaltung, dass für Dezember-Bestellungen keine Zahlungserinnerungen verschickt worden waren.

Derselbe `OrderService` verschickt auch Zahlungserinnerungen an Kunden, die auf Rechnung kaufen. Deren Zahlungsziel liegt zufällig ebenfalls bei 14 Tagen nach Lieferung, also hat jemand `withinDeadline` dafür wiederverwendet. Zwei Geschäftsregeln, die nichts miteinander zu tun haben und zwei verschiedenen Abteilungen gehören, teilten sich eine Implementierung, weil sie zufällig dieselbe Zahl hatten.

Eine Komponente, die gleichzeitig dem Kundenservice, der Buchhaltung und dem Marketing dient, hat drei Gründe, sich zu ändern. Jede Änderung für einen davon riskiert, die anderen kaputt zu machen.

Vertiefung: :series-link[Eine Verantwortung pro Komponente]{slug="one-responsibility-per-component"}

## Schritt 5: Die Regel am falschen Ort

Schließlich stellt der Entwickler fest, dass die Rückgaberegel auch in einer SQL-Abfrage steckt und dass die Domänenlogik von der Systemuhr abhängt. Die Datumsformatierung für den Shop wird im Backend berechnet. Die Datenbankabfrage kennt Geschäftsregeln. Die Geschäftsregel kennt die Uhr.

Wenn Verantwortungen in der falschen Schicht liegen, breiten sich Änderungen über Schichten aus, die das nichts angehen sollte. Die UI sollte nur entscheiden, wie die Dinge aussehen. Die Persistenz sollte nur Zustand speichern und wiederherstellen. Die Domäne sollte die Geschäftsregeln kennen und nichts über Technik wissen. Und die Anwendungsschicht sollte die Domäne orchestrieren und externe Abhängigkeiten hinter Ports halten.

Vertiefung: :series-link[Verantwortung in der richtigen Schicht]{slug="responsibilities-in-the-right-layer"}

## Dieselbe Änderung, noch einmal

Nach dem Refactoring ist die Rückgabefrist ein Konzept in der Domäne. Sie wird an einer Stelle berechnet. Das Frontend, die E-Mail und der Report holen sie alle von dort. Zahlungsziele sind ein eigenes Konzept. Die Uhr wird hineingereicht.

Jetzt sieht das Dezember-Ticket so aus:

```kotlin
class HolidayReturnPolicy(private val standardPolicy: ReturnPolicy) : ReturnPolicy {
    override fun returnPeriodFor(orderedOn: LocalDate, deliveredOn: LocalDate): ReturnPeriod {
        val standardPeriod = standardPolicy.returnPeriodFor(orderedOn, deliveredOn)
        if (orderedOn.month != Month.DECEMBER) return standardPeriod
        return standardPeriod.extendedTo(LocalDate.of(orderedOn.year + 1, 1, 31))
    }
}
```

```kotlin
@Test
fun `december orders can be returned until january 31`() {
    val policy = HolidayReturnPolicy(StandardReturnPolicy())

    val period = policy.returnPeriodFor(
        orderedOn = LocalDate.of(2026, 12, 10),
        deliveredOn = LocalDate.of(2026, 12, 12),
    )

    assertEquals(LocalDate.of(2027, 1, 31), period.endsOn)
}
```

Eine neue Klasse, ein neuer Test, eine Zeile Verdrahtung. Derselbe Entwickler setzt es in weniger als der Stunde um, die der Product Owner geschätzt hat. Nicht weil er das System jetzt besser kennt, sondern weil er es nicht muss.

## Warum mir diese Arbeit Spaß macht

Ich bin ehrlich: Software wartbar zu machen ist einer der befriedigendsten Teile meiner Arbeit. Ein implizites Konzept finden, darüber nachdenken, wie man es in der Struktur des Codes ausdrückt, und zusehen, wie aus kompliziertem Code etwas Einfaches, Schönes und Stabiles wird – davon bekomme ich nie genug.

Und es gibt eine ganz bestimmte Art von Ruhe, wenn man eine doppelte Entscheidung an einem Ort zusammenführt. Ich weiß, dass der nächste Entwickler, der sie ändert, dort keinen Bug produzieren wird. Nicht weil er vorsichtig ist, sondern weil der Code keinen Raum dafür lässt.

Das bedeutet Wartbarkeit für mich. Sie ist kein Anliegen für Puristen. Sie ist das, was Software erlaubt, sich weiter zu verändern, und was den Menschen, die daran arbeiten, wieder Freude an ihrer Arbeit gibt. Keine Angst mehr vor dem Deployment am Freitag. Keine verschobenen Updates mehr. Keine Vorfälle mehr, deren Ursache man wochenlang sucht.

Das Ziel ist einfacher, langweiliger Code, der tut, was er soll.

## Die Serie

Dieser Beitrag ist die Übersicht einer Serie. Jede Vertiefung greift einen Schritt aus der Geschichte auf und geht ein konkretes Refactoring durch:

1. :series-link[Legacy-Code ohne Angst refactoren]{slug="refactoring-legacy-code-without-fear" pending=" – folgt bald"}
2. :series-link[Implizite Konzepte explizit machen]{slug="making-implicit-concepts-explicit" pending=" – folgt bald"}
3. :series-link[Eine Entscheidung, ein Ort]{slug="one-decision-one-place" pending=" – folgt bald"}
4. :series-link[Eine Verantwortung pro Komponente]{slug="one-responsibility-per-component" pending=" – folgt bald"}
5. :series-link[Verantwortung in der richtigen Schicht]{slug="responsibilities-in-the-right-layer" pending=" – folgt bald"}
