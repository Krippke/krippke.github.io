# Serie: Die versteckten Kosten von unwartbarem Code

Sidecar-Dokument der Serie. Hier steht alles *über* die Serie: Zweck, roter Faden, Stimme, Beispiel, Konventionen. Die Inhalte selbst stehen nur in den Posts.

## Zweck und Zielgruppe

- Die Serie erklärt die versteckten Kosten von schlecht wartbarem Code und zeigt an konkreten Beispielen, wie sich Wartbarkeit verbessern lässt.
- Grundlage sind echte Erfahrungen aus Legacy-Systemen, die durch konsequentes Refactoring wieder Freude an der Feature-Entwicklung ermöglicht haben.
- Zielgruppe: Entwickler und Tech Leads. Kosten so benennen, dass ein Tech Lead einen Post an sein Management weitergeben kann.
- Ton: Erfahrung teilen, nicht verkaufen.

## Roter Faden

1. **Versteckte Kosten:** Sichtbar werden sie als Angst - vor Produktiv-Deployments, vor Dependency-Upgrades, vor Fehlern, deren Ursache Wochen zur Behebung braucht.
2. **Der Entwickler als Client des Codes:** Wartbarkeit bedeutet, die kognitive Last für den Menschen zu senken, der den Code als Nächstes ändert.
3. **Das Vorgehen:** Verstehen → Verhalten in Tests überführen (dabei erste Refactorings) → implizite Konzepte und verteilte Entscheidungen notieren → gezielt umbauen.
4. **Die Prinzipien:** implizite Konzepte explizit machen, jede Entscheidung nur einmal, eine Verantwortlichkeit pro Komponente, Verantwortlichkeiten auf der richtigen Ebene. Getragen von Dependency-Rule und Tests als Spezifikation.
5. **Freude und Ruhe:** Zu sehen, wie komplexer Code simpel, schön und stabil wird. Zu wissen, dass ein künftiger Entwickler an dieser Stelle keinen Bug mehr produziert.

**Motto:** Einfacher, langweiliger Code, der tut, was er soll.

## Stimme des Autors

Referenz für Ton und Kernaussagen. Die Posts übersetzen und verdichten diese Aussagen.

> Ich habe schon viele Legacy-Systeme übernommen und so umgebaut, dass sich wieder effizient an ihnen arbeiten ließ. Der erste Schritt ist das Verstehen: Verstehen, welches Problem gelöst und welcher Mehrwert geschaffen werden soll. Verstehen, wie dieses Ziel erreicht wird, mit welchen Konzepten und welche Akteure sich in diesem System bewegen. Verstehen, welche Aufgabe und welche Verantwortlichkeit jeder Akteur hat. Hätten diese Legacy-Systeme Tests gehabt, wäre das, denke ich, sehr häufig eine einfache Aufgabe gewesen. In allen Fällen konnte jedoch kaum von Testabdeckung die Rede sein. Das zweite Ziel ist also, das bestehende Verhalten – möglichst ohne große Anpassungen – durch Tests abzusichern. Dabei sind oft schon die ersten Refactorings notwendig, denn eine Komponente mit vielen Abhängigkeiten erfordert einen enormen Testaufbau. In diesem Stadium ist deshalb die Abwägung zwischen „Wie stark verändere ich die Struktur des Codes?“ und „Wie aufwendig darf mein Testaufbau sein?“ Alltag. Kompromisse gehe ich hier nur in den seltensten Fällen ein, denn sie rächen sich in absehbarer Zeit. Das bedeutet: eine klare Domäne ohne technische Details, ein Application Layer, der die Akteure der Domäne orchestriert, eine Persistenz, deren Aufgabe es ist, Zustände zu speichern und wiederherzustellen, und eine Humble UI – alles klar in die verschiedenen Layer getrennt. Auf dem Weg zur Testabdeckung baue ich ein Verständnis für die Codebasis auf. Ich lerne die Konzepte kennen und finde implizite Konzepte, die ich notiere, um sie später explizit zu machen. Ich finde Entscheidungen, die an unterschiedlichen Stellen getroffen werden. Alles, was nicht klar ins Bild passt und trotzdem irgendwie funktioniert, notiere ich für die spätere Analyse. Das sind häufig Hinweise auf ein strukturelles Problem oder, anders gesagt, auf ein Konzept, das extrem kompliziert umgesetzt wurde. Das Ziel ist einfacher, langweiliger Code, der tut, was er soll.

> Tests sind die Definition von Verhalten. Beim Verbessern einer Legacy-Codebasis ist irgendeine Definition besser als keine. Das heißt: Auch wenn ich als Unwissender Definitionen erstelle, dürfen diese anfangs falsch sein. Sie werden im Laufe der Iterationen mit den Domain-Experten und Stakeholdern richtiggestellt. Wichtig ist, dass das Verhalten als automatisierter Test formuliert ist. Das bringt Geschwindigkeit. Ohne Tests muss man, bildlich gesprochen, sehr langsam und bedächtig gehen. Mit Tests kann man rennen, denn man wird sofort darauf hingewiesen, wenn man etwas kaputt gemacht hat.

> Das Wartbarmachen von Software bereitet mir enorme Freude: implizite Konzepte finden, überlegen, wie sie sich als explizite Konzepte strukturell abbilden lassen, und sehen, wie sich teilweise sehr komplexer Code in einfachen, schönen, stabilen Code verwandelt. Wenn ich doppelte Informationen oder Entscheidungen an einer Stelle zusammenführe und weiß, dass ein künftiger Entwickler bei Änderungen an dieser Stelle keinen Bug mehr produzieren wird, ist das sehr beruhigend.

> Implizite Konzepte führen oft dazu, dass dieselben Entscheidungen verteilt im System getroffen werden. Das führt unvermeidlich zu Drift und erhöht damit das Fehlerpotenzial bei künftigen Weiterentwicklungen enorm.

## Durchgehendes Beispiel

Alle Posts verwenden dieselbe Domäne und dieselben Namen. Code in Python, Tests mit pytest.

**Domäne:** Online-Shop. **Protagonist:** ein neues Teammitglied ("the new developer").

**Änderungsanforderung:** "Bestellungen aus dem Dezember können bis zum 31. Januar zurückgegeben werden." Geschätzt: eine Stunde.

**Legacy-Zustand:**
- `OrderService` mit `calculate_total`, `request_return`, `create_invoice`, `send_payment_reminders`, `send_confirmation`. Greift direkt auf `self.db` (SQL), `self.mailer` und `self.pdf_renderer` zu.
- `_within_deadline(order)`: `order.delivered_at + timedelta(days=14) >= datetime.now()`. Wird von `request_return` **und** von `send_payment_reminders` (Zahlungsziel Kauf auf Rechnung, ebenfalls 14 Tage ab Lieferung) genutzt.
- Magic Number `order.status == 4` bedeutet "geliefert".
- Die vier Stellen der Rückgabefrist, drei Interpretationen:
  1. Backend `_within_deadline`: 14 Tage ab Lieferung, Serverzeit
  2. Frontend (JavaScript): 14 Tage ab `orderedAt`
  3. SQL-Report für den Kundenservice: `delivered_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 weeks'`
  4. Bestätigungsmail: fester Text "within 14 days"
- Der Bug beim naiven Umsetzen: Die Dezember-Regel wird in `_within_deadline` eingebaut → Dezember-Bestellungen bekommen bis Februar keine Zahlungserinnerungen.

**Zielzustand:**
- Domäne: `Order` (`mark_delivered(on, return_policy)` wendet die Policy einmalig bei Lieferung an und hält danach `return_period`; `request_return(today)`; `is_delivered()`), `OrderStatus` (Enum), `ReturnPeriod` (Value Object mit `ends_on`, `allows_return_on(day)`, `extended_to(day)`, `ends_soon(today)`), `ReturnPolicy` (Schnittstelle), `StandardReturnPolicy` (`RETURN_DAYS = 14`), `HolidayReturnPolicy` (dekoriert die Standard-Policy), `PaymentTerm` + `InvoicePaymentTerms` (`PAYMENT_DAYS = 14`, eigenes Konzept, getrennt von der Rückgabefrist). Das gesetzliche Widerrufsrecht (`WITHDRAWAL_DAYS = 14`) bleibt bewusst getrennt.
- Application: Use Cases `RequestReturn` (`OrderRepository`, `Clock`, `CustomerNotifications`) und `SendPaymentReminders` (zusätzlich `InvoicePaymentTerms`).
- Ports: `Clock` (`today()`; in DD1 als Zwischenschritt `now()`, solange das minutengenaue Altverhalten gilt), `OrderRepository` (`get`, `save`, `unpaid_invoice_orders`), `CustomerNotifications`. Adapter: `SystemClock` (mit der Zeitzone des Shops, Entscheidung des Kundenservice), `FixedClock` (Test), `PostgresOrderRepository`.
- Persistenz speichert `return_period_ends_on`. Der Report filtert nur noch auf den gespeicherten Wert.
- UI als Humble Object: bekommt `return_period_ends_on` und `return_period_ends_soon` und entscheidet nur über Darstellung.
- Entscheidungen des Kundenservice im Verlauf: ab Lieferung, ganze Tage, lokale Zeit des Shops; bei Dezember-Bestellungen gilt die später endende Frist.

**Falsche Doppelung:** gesetzliches Widerrufsrecht (14 Tage) vs. freiwillige Rückgabefrist (heute auch 14 Tage). Gleicher Wert, zwei Entscheidungen.

## Serienübersicht

| # | Datei | Kernfrage | Hauptreferenz |
|---|---|---|---|
| 0 | `the-hidden-cost-of-unmaintainable-code.md` | Was kostet unwartbarer Code wirklich, und wie komme ich da raus? | - |
| 1 | `refactoring-legacy-code-without-fear.md` | Wie bekomme ich ein Sicherheitsnetz in ein System ohne Tests? | Feathers, *Working Effectively with Legacy Code* |
| 2 | `making-implicit-concepts-explicit.md` | Wie finde ich implizite Konzepte und bilde sie ab? | Evans, *Domain-Driven Design*, Kap. 9 |
| 3 | `one-decision-one-place.md` | Warum driften verteilte Entscheidungen, und wann ist Doppelung keine? | Hunt & Thomas (DRY), Sandi Metz |
| 4 | `one-responsibility-per-component.md` | Woran erkenne ich, dass eine Komponente geteilt werden muss? | Martin (SRP), Ousterhout |
| 5 | `responsibilities-in-the-right-layer.md` | Welche Verantwortung gehört auf welche Ebene? | Cockburn, Martin (Clean Architecture) |

Reihenfolge der Veröffentlichung: 0 zuerst, dann 1 bis 5.

## Konventionen

- Englisch, Ich-Perspektive, kurze Absätze, Einstieg mit einer konkreten Szene. Bindestrich " - " statt Gedankenstrich.
- Deep Dives: Szene → Symptom → Kosten → Refactoring vorher/nachher → Test als Spezifikation → wo es schwierig wird → persönliches Fazit.
- Jeder Deep Dive verlinkt die Übersicht. Die Übersicht verlinkt alle Deep Dives.
- Nicht wiederholen, sondern verlinken:
  - [The role of tests](https://www.manuel-holzrichter.de/2024/01/11/the-role-of-tests/)
  - [Why you always need to be wrong](https://www.manuel-holzrichter.de/2026/02/19/why-you-always-need-to-be-wrong/)
  - [Foreign systems will change](https://www.manuel-holzrichter.de/2026/03/29/foreign-systems-will-change-heres-how-to-be-ready/) für Ports und Adapter
- `_drafts/the-role-of-architecture.md` ist ein eigenständiger Post und nicht Teil der Serie.

## Checkliste für die Veröffentlichung

- [ ] `TODO-link` durch echte Permalinks ersetzen (hängen vom Veröffentlichungsdatum ab): `grep -rn "TODO-link" _drafts _posts`
- [ ] Teaser-Bilder ersetzen: aktuell Platzhalter, DD4 und DD5 verwenden bereits genutzte Bilder
- [ ] `date` und `last_modified_at` im Front Matter ergänzen
- [ ] Eintrag in `llms.txt`
- [ ] Nach jeder Veröffentlichung eines Deep Dives den Link in der Übersicht ergänzen
