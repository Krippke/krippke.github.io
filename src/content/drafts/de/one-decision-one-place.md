---
title: "Eine Entscheidung, ein Ort"
excerpt: "Jede Entscheidung, die an mehr als einem Ort lebt, driftet auseinander. Wie doppelte Entscheidungen Bugs erzeugen, lange bevor jemand sie anfasst – und warum zwei gleiche Zahlen nicht immer eine Duplizierung sind."
teaser: /assets/images/one-decision.jpg
tags: [dry, single-source-of-truth, refactoring, legacy-code, maintainability]
slug: eine-entscheidung-ein-ort
---

Dieser Beitrag ist Teil der Serie :series-link[Die versteckten Kosten von nicht wartbarem Code]{slug="the-hidden-cost-of-unmaintainable-code"}. Ein neuer Entwickler soll in einem Onlineshop eine kleine Änderung umsetzen: „Bestellungen aus dem Dezember können bis zum 31. Januar zurückgegeben werden.“ Beim :series-link[Schreiben von Charakterisierungstests]{slug="refactoring-legacy-code-without-fear"} hat er herausgefunden, dass es die Rückgabefrist :series-link[als Konzept gar nicht gab]{slug="making-implicit-concepts-explicit"}. Jetzt findet er heraus, dass es sie viermal gibt.

Im Team-Channel landet ein Support-Ticket. Ein Kunde wollte eine Jacke zurückgeben. Der Shop sagte ihm, die Rückgabefrist sei am 12. März abgelaufen. Der Kundenservice prüfte seinen Report: Die Bestellung war noch rückgabefähig. Der Kunde versuchte es trotzdem, und das Backend nahm die Rückgabe an. Drei Systeme, drei Antworten.

Der Entwickler macht sich auf die Suche und findet die Rückgabefrist an vier Stellen.

## Vier Orte, drei Antworten

Im Backend: 14 Tage ab Lieferung, in Serverzeit:

```kotlin
private fun withinDeadline(order: Order) =
    order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
```

Im Frontend: 14 Tage ab Bestelldatum:

```javascript
const returnPeriodEnd = addDays(order.orderedAt, 14);
```

Im Report des Kundenservice: zwei Wochen ab Lieferung, in UTC:

```sql
SELECT * FROM orders
WHERE status = 4
  AND delivered_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 weeks';
```

Und in der Bestellbestätigung per E-Mail, fest eingetragen:

```
You can return your items within 14 days.
```

Die Jacke wurde am 26. Februar bestellt und am 1. März geliefert. Das Frontend sagte 12. März. Das Backend sagte 15. März. Der Report sagte, je nach Tageszeit, 14. oder 15. März.

## Niemand hat einen Fehler gemacht

Das Interessante daran: Keine dieser Stellen war falsch, als sie geschrieben wurde.

Das Frontend-Feature entstand zu einer Zeit, in der die Bestell-API das Lieferdatum noch nicht zurückgab. Der Entwickler nahm das Bestelldatum, weil es das Nächstliegende war, das zur Verfügung stand. Den Report schrieb jemand unter Zeitdruck, der eine Liste für den Kundenservice brauchte und die Abfrage so formulierte, wie er die Regel verstanden hatte. Den E-Mail-Text schrieb das Marketing, das wusste, dass in den AGB 14 Tage standen. Jeder hat mit den Informationen, die er hatte, eine vernünftige Entscheidung getroffen.

Aber alle haben *dieselbe* Entscheidung getroffen. Getrennt voneinander, zu unterschiedlichen Zeiten, mit leicht unterschiedlichem Verständnis. Und getrennte Kopien einer Entscheidung driften auseinander. Nicht vielleicht. Zwangsläufig.

Dahin führen :series-link[implizite Konzepte]{slug="making-implicit-concepts-explicit"}. Wenn eine Regel im Code kein Zuhause hat, baut sich jeder, der sie braucht, seine eigene Version. Jede Kopie ist eine Gelegenheit für eine leicht andere Auslegung, und jede künftige Änderung muss jede Kopie finden und anpassen. Übersiehst du eine, widerspricht sich das System selbst.

Das Dezember-Ticket hat diesen Bug nicht erzeugt. Der Bug war schon seit Monaten in Produktion. Das Ticket hat ihn nur sichtbar gemacht, weil es jemanden gezwungen hat, sich alle vier Stellen gleichzeitig anzusehen.

## Welche ist richtig?

Das ist die Frage, die aus einem Ticket für eine Stunde ein Ticket für drei Tage macht. Der Code kann sie nicht beantworten. Vier Implementierungen, vier Meinungen.

Also macht der Entwickler, was ich in dieser Situation immer mache: einen Test für eine Auslegung schreiben und damit zu den Leuten gehen, die es wissen.

```kotlin
@Test
fun `return period ends 14 days after delivery`() {
    val period = StandardReturnPolicy().returnPeriodFor(
        orderedOn = LocalDate.of(2026, 2, 26),
        deliveredOn = LocalDate.of(2026, 3, 1),
    )

    assertEquals(LocalDate.of(2026, 3, 15), period.endsOn)
}
```

Der Test kann falsch sein. Das ist in Ordnung – jede Definition ist besser als keine Definition. Der Kundenservice bestätigt: ab Lieferung, ganze Tage, in der Ortszeit des Shops. Jetzt ist die Entscheidung nicht nur getroffen, sondern auch in einer Form aufgeschrieben, die lautstark fehlschlägt, wenn jemand sie jemals versehentlich ändert.

## Einmal entscheiden, überall nachfragen

Die Lösung ist nicht, vier Stellen anzupassen. Vier Stellen driften wieder auseinander. Die Lösung ist, die Entscheidung an genau einem Ort zu treffen und alles andere nach dem Ergebnis fragen zu lassen.

Die Domäne besitzt die Regel. Sie wendet die Rückgaberegelung einmal an, wenn die Bestellung geliefert wird, und die Bestellung behält ihre `ReturnPeriod`. Alles andere bekommt die Antwort:

```kotlin
data class OrderDetails(
    val id: Long,
    val orderedOn: LocalDate,
    val returnPeriodEndsOn: LocalDate?,
)

fun Order.toDetails() = OrderDetails(
    id = id,
    orderedOn = orderedOn,
    returnPeriodEndsOn = returnPeriod?.endsOn,
)
```

Das Frontend berechnet nichts mehr. Es zeigt ein Datum an, das es bekommen hat:

```javascript
const returnPeriodEnd = formatDate(order.returnPeriodEndsOn);
```

Die Bestätigungs-E-Mail bekommt dasselbe Datum:

```
You can return your items until {{ return_period_ends_on | format_date }}.
```

Und der Report kennt die Regel nicht mehr. Die Persistenzschicht speichert das Ende der Rückgabefrist wie jeden anderen Zustand, und die Abfrage filtert nur noch auf diesen gespeicherten Wert. Wie das im Detail funktioniert, ist Teil von :series-link[Verantwortung in der richtigen Schicht]{slug="responsibilities-in-the-right-layer"}.

Jetzt ändert die Dezember-Regel genau einen Ort. Shop, E-Mail und Report ziehen automatisch nach, weil sie die Regel nie gekannt haben.

## Wenn zwei gleiche Dinge nicht dasselbe sind

Nach so einem Refactoring ist die Versuchung groß, in der Codebasis Jagd auf jede Duplizierung zu machen. Der Entwickler findet das hier in dem Modul, das die Rechtstexte erzeugt:

```kotlin
const val WITHDRAWAL_DAYS = 14L
```

Und das hier in der Rückgaberegelung:

```kotlin
const val RETURN_DAYS = 14L
```

Gleiche Zahl, gleiche Einheit, beide drehen sich darum, dass Kunden etwas zurückschicken. Zusammenführen?

Nein. Das Erste ist das gesetzliche Widerrufsrecht. In der EU können Kunden einen Onlinekauf innerhalb von 14 Tagen nach Erhalt der Ware widerrufen, und diese Zahl legt das Gesetz fest. Das Zweite ist die freiwillige Rückgabefrist des Shops. Diese Zahl legt das Marketing fest. Heute sind sie zufällig gleich.

Führst du sie zusammen, ändert die Verlängerung im Dezember plötzlich die gesetzliche Widerrufsbelehrung. Schlimmer noch: An dem Tag, an dem das Marketing beschließt, die Rückgabefrist für reduzierte Artikel auf 7 Tage zu verkürzen, würde der Shop auch ein gesetzliches Recht verkürzen, und niemand würde es merken, bis es ein Anwalt tut.

Sandi Metz hat es gut auf den Punkt gebracht: „Duplizierung ist weitaus billiger als die falsche Abstraktion.“ Als Andy Hunt und Dave Thomas in *The Pragmatic Programmer* den Begriff DRY prägten, ging es ihnen nicht um identischen Code. Sie schrieben: „Jedes Stück Wissen muss eine einzige, eindeutige und maßgebliche Repräsentation innerhalb eines Systems haben.“ Wissen. Nicht Text.

Die Frage ist also nie: „Sehen die gleich aus?“ Die Frage ist: „Ist das dieselbe Entscheidung, getroffen von denselben Leuten, aus demselben Grund?“ Wenn ja, gehört sie an einen Ort. Wenn nein, braucht sie zwei Orte, auch wenn sie heute identisch aussehen. Das Zahlungsziel im selben Shop ist ein weiteres Beispiel: ebenfalls 14 Tage nach Lieferung, aber festgelegt von der Buchhaltung, nicht vom Kundenservice. Mehr dazu in :series-link[Eine Verantwortung pro Komponente]{slug="one-responsibility-per-component"}.

## Wo es schwierig wird

**Alle Kopien finden.** Kopien einer Entscheidung sehen selten gleich aus. `plusDays(14)`, `INTERVAL '2 weeks'`, `addDays(..., 14)` und „within 14 days“ sind alle dieselbe Entscheidung. Nach der Zahl zu suchen hilft. Charakterisierungstests helfen mehr, weil sie dich zwingen, dir anzusehen, was jeder Teil des Systems tatsächlich tut.

**Entscheiden, welche Kopie richtig ist.** Manchmal ist die Antwort: keine. Manchmal ist jede Kopie für einen anderen Teil des Geschäfts richtig, und du hast gerade entdeckt, dass es zwei Konzepte gibt statt einem. So oder so ist das keine Entscheidung, die der Entwickler allein treffen sollte.

**Systemgrenzen überschreiten.** Frontend, Report und E-Mail-Template gehören oft verschiedenen Personen oder Teams. Die Entscheidung zusammenzuführen heißt, sich darauf zu einigen, wem sie gehört und wer nach ihr fragt. Dieses Gespräch ist schwieriger als der Code, und wertvoller.

## Die Zufriedenheit des einen Ortes

Es gibt eine besondere Art von Zufriedenheit, die entsteht, wenn du eine doppelte Entscheidung an einem Ort zusammenführst. Ich weiß, dass der nächste Entwickler, der die Rückgabefrist ändert, keinen Bug im Frontend, im Report oder in der E-Mail erzeugen wird. Nicht, weil er sorgfältig ist, nicht, weil er die Codebasis kennt, sondern weil es nur einen Ort gibt, den er ändern muss.

Das meine ich mit wartbarem Code. Es geht nicht um Eleganz. Es geht darum, Gelegenheiten für Fehler zu beseitigen, damit die Leute, die nach uns kommen, nicht perfekt sein müssen.
