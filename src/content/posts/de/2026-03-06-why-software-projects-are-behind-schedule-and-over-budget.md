---
title: "Warum dein Softwareprojekt hinter dem Zeitplan liegt (und über dem Budget)"
excerpt: "Softwareprojekte scheitern selten an der technischen Arbeit. Sie scheitern an langen Feedback-Schleifen, ungeprüftem Vertrauen und Schätzungen aus dem Bauch heraus – alle drei lassen sich beheben."
date: 2026-03-06 12:00:00 +0100
updated: 2026-03-06T12:00:00+01:00
teaser: /assets/images/domino.jpg
tags: [software-development, project-management, estimation, communication, feedback-loops]
slug: warum-softwareprojekte-zu-spaet-und-zu-teuer-sind
---

Mittwochnachmittag, drei Wochen vor der Deadline. Das Projekt ist vor sechs Monaten gestartet, mit einem aufgeräumten Backlog und einem Team, das ehrlich daran geglaubt hat, pünktlich zu liefern. Jetzt weicht im Statusmeeting jeder den Blicken der anderen aus. Die Demo letzte Woche hat ein grundlegendes Missverständnis bei einem zentralen Feature aufgedeckt. Die Hälfte der Arbeit aus dem Sprint muss nachgebessert werden. Die Restschätzung hat sich still und leise verdoppelt. Niemand ist überrascht. Aber kommen sehen hat es auch niemand.

Ich habe schon auf beiden Seiten dieses Tisches gesessen. Als Entwickler, der sich fragt, wie wir hier gelandet sind, und als Lead, der einem Stakeholder erklären muss, warum aus drei Monaten sechs geworden sind. Nach mehr als 15 Jahren Softwareentwicklung bin ich überzeugt: Die Antwort ist fast nie „wir waren faul“ oder „wir konnten nicht programmieren“. Die technische Arbeit bringt ein Projekt selten aus der Spur. Was es aus der Spur bringt, sind **lange Feedback-Schleifen**, **ungeprüftes Vertrauen** und **Schätzungen nach Bauchgefühl**.

Die [Standish Group hat über 50.000 Technologieprojekte analysiert](https://opencommons.org/CHAOS_Report_on_IT_Project_Outcomes) und festgestellt, dass 66 % ganz oder teilweise scheitern. Nur 31 % werden pünktlich, im Budget und mit dem geplanten Umfang geliefert. Das sind schlechte Aussichten. Aber die Ursachen lassen sich überraschend gut beheben.

## Die wahren Kosten langer Feedback-Schleifen

Ich habe einmal geschrieben, dass :series-link[Softwareentwicklung wie ein Spaziergang im Nebel ist]{slug="the-role-of-iterating"}. Du siehst das Ziel nicht. Du machst kleine Schritte, prüfst, was du vorfindest, und entscheidest, in welche Richtung es weitergeht. Lange Feedback-Schleifen entstehen, wenn du damit aufhörst. Du läufst selbstbewusst Hunderte Meter, ohne dich umzusehen, und wenn sich der Nebel lichtet, merkst du, dass du die ganze Zeit in die falsche Richtung gelaufen bist.

Eine Feedback-Schleife ist die Zeit zwischen einer Entscheidung und dem Moment, in dem du erfährst, ob sie richtig war. Jeder Tag ohne Validierung ist ein Tag, an dem du vielleicht das Falsche baust. [Die Forschung von IBM](https://www.functionize.com/blog/the-cost-of-finding-bugs-later-in-the-sdlc) hat das in Zahlen gefasst: Einen Bug zu beheben, der während der Implementierung gefunden wird, kostet ungefähr sechsmal so viel, wie ihn schon im Design zu erwischen. Je weiter sich ein Fehler von seinem Ursprung entfernt, desto teurer wird es, ihn rückgängig zu machen.

## Erst validieren, dann bauen

Am Anfang meiner Laufbahn habe ich drei Wochen an einem aufwendigen Reporting-Modul gebaut. Schöne Diagramme. Konfigurierbare Zeiträume. PDF-Export. Das volle Programm. Als wir es dem Kunden gezeigt haben, hat er zehn Sekunden draufgestarrt und gesagt: „Das ist schön, aber wir brauchten eigentlich nur eine einzige Zahl auf einem Dashboard.“ Drei Wochen Arbeit für etwas, das an einem Tag erledigt gewesen wäre. Der Code war in Ordnung. Wir haben einfach das Falsche gebaut.

Dieses Muster sehe ich überall. Teams behandeln alle Einträge im Backlog als Bauaufgaben, obwohl viele davon eigentlich Validierungsaufgaben sind. Die Frage ist selten „Können wir das bauen?“. Sie lautet fast immer „Sollten wir das bauen, und passt unser Verständnis zur Realität?“. Bau die kleinstmögliche Version und stell sie einem echten Nutzer hin. Keinen Prototyp, den jemand stellvertretend abgenickt hat. Sondern das tatsächlich kleinste Ding, das deine riskanteste Annahme testet.

[Studien zeigen](https://digitaloctopusgroup.com/breaking-down-the-70-failure-rate-in-software-development/), dass 70 % der gescheiterten Digitalisierungsprojekte auf Probleme mit den Anforderungen zurückgehen. Nicht weil die Leute nachlässig waren, sondern weil niemand die Anforderungen früh genug validiert hat.

Eine falsche Annahme zu korrigieren, auf der du monatelang aufgebaut hast, ist wie :series-link[das Fundament eines Hauses auszutauschen, während du schon die Dachziegel verlegst]{slug="the-role-of-writing"}. Nicht unmöglich. Aber Spaß macht es niemandem.

## Missverständnisse

Hier ist eins, das ein Team, mit dem ich gearbeitet habe, zwei komplette Sprints Nacharbeit gekostet hat. Der Stakeholder wollte „Benutzergruppen“. Die Entwickler haben „Berechtigungsmodell“ verstanden – Rollen, Zugriffskontrolle, Hierarchien. Gemeint hatte der Stakeholder aber eine Möglichkeit, Nutzer zu markieren, um ihnen gesammelt E-Mail-Benachrichtigungen zu schicken. Dieselben Worte. Komplett unterschiedliche Features. Aufgefallen ist es erst in der Demo.

Das ist kein Problem der Menschen. Es ist ein Problem des Prozesses. Wenn zwischen „das haben wir besprochen“ und „wir haben geprüft, was wir gemeint haben“ Wochen liegen, haben kleine Missverständnisse genug Zeit, zu großen Lücken in der Umsetzung zu werden.

Das [Project Management Institute](https://www.pmi.org/learning/library/communication-method-content-in-project-9937) hat herausgefunden, dass schlechte Kommunikation bei 56 % der gescheiterten Projekte eine Rolle spielt. Projekte mit guter Kommunikation liefern doppelt so oft den geplanten Umfang. Der Unterschied ist nicht Talent. Es geht darum, wie oft und wie früh ihr die Schleife zwischen Annahme und Bestätigung schließt.

Verkürze also den Abstand zwischen Gespräch und Vorführung. Schreib auf, was du verstanden hast. Skizziere es. Bau an einem Nachmittag einen Wegwerf-Prototyp. Mach aus der abstrakten Einigung etwas Konkretes, das sich beide Seiten ansehen können, um dann zu sagen „ja, genau das meinte ich“ – oder besser noch „nein, nicht ganz“.

Ich habe über :series-link[die Rolle des Schreibens]{slug="the-role-of-writing"} beim Debuggen des eigenen Denkens geschrieben. Hier gilt dasselbe. Wenn du nicht in einfachen Worten aufschreiben kannst, was du baust, hast du es noch nicht verstanden.

## Deine Testsuite ist eine Feedback-Schleife

Bei den Problemen oben sind andere Menschen beteiligt. Dieses hier liegt ganz bei uns.

Eine fehlende oder lückenhafte Testsuite ist die Feedback-Schleife, die wir selbst in der Hand haben – und die Teams am meisten vernachlässigen. Ohne automatisierte Tests kannst du nur herausfinden, ob deine Änderung etwas kaputt gemacht hat, indem du dich von Hand durch die Anwendung klickst. Das kostet Zeit. Also lässt du es bei „kleinen Änderungen“ weg. Dann macht eine kleine Änderung etwas drei Bildschirme weiter kaputt, und du erfährst es in der nächsten Demo. Oder in Produktion.

Tests sind nicht nur Qualitätsschranken. Sie sind Feedback-Schleifen im Schnelldurchlauf. Eine solide Testsuite sagt dir innerhalb von Sekunden, ob deine letzte Änderung zu allen Annahmen passt, auf denen das System gebaut wurde. Sekunden, nicht Wochen.

[Untersuchungen zeigen](https://codesuite.org/blogs/identifying-bugs-early-the-way-to-cutting-software-costs-by-50/), dass frühes und kontinuierliches Testen rund 40 % der gesamten Entwicklungszeit spart. Tests zu schreiben ist nicht umsonst, aber gegen die Kosten, Probleme spät zu finden, ist dieser Aufwand nichts.

Zurück zum Nebel: Deine Testsuite ist der Boden unter deinen Füßen. Du siehst vielleicht nicht weit, aber du weißt zumindest, dass der Schritt, den du gerade gemacht hast, auf festem Grund stand.

## Ungeprüftes Vertrauen

Wenn ein Stakeholder sagt „wir brauchen das“, liegt es nahe, der Aussage zu vertrauen und loszulegen. Vertrauen fühlt sich professionell an. Nachfragen fühlt sich an, als würde man im Weg stehen. Also landet das Feature im Backlog, wird geschätzt, gebaut, ausgeliefert. Und niemand nutzt es.

Vertrauen ist in Ordnung. **Ungeprüftes** Vertrauen ist das Problem. Jede Aussage darüber, was Nutzer brauchen, ist eine Annahme, bis sie durch Belege gestützt ist. Kunden beschreiben Lösungen statt Probleme. Kollegen geben Informationen durch ihre eigene Interpretation gefiltert weiter. Niemand lügt. Aber beide filtern die Realität durch ihre Perspektive. Der Entwickler, der hört „der Kunde will ein Benachrichtigungssystem“, weiß vielleicht nicht, dass der Kunde eigentlich gesagt hat „Ich verpasse manchmal wichtige Neuigkeiten“ – ein Problem, das sich auf ein Dutzend Arten lösen lässt, die meisten davon einfacher als ein Benachrichtigungssystem.

[Die Standish Group hat festgestellt](https://www.mountaingoatsoftware.com/blog/are-64-of-features-really-rarely-or-never-used), dass 64 % der Software-Features selten oder nie genutzt werden. Nur 20 % liefern hohen Nutzen. Jedes dieser ungenutzten Features wurde irgendwann „gebraucht“. Jemand hat es gesagt, und das Team hat ihm vertraut.

Der [Bestätigungsfehler (Confirmation Bias)](https://www.researchgate.net/publication/235430372_Confirmation_Bias_in_Software_Development_and_Testing_An_Analysis_of_the_Effects_of_Company_Size_Experience_and_Reasoning_Skills) macht es noch schlimmer. Sobald ein Team eine Behauptung als Tatsache akzeptiert hat, sucht es nach Belegen, die die Entscheidung stützen, und ignoriert Signale, die ihr widersprechen. Das Feature wächst im Umfang. Niemand fragt noch einmal: „Wissen wir eigentlich, dass Nutzer genau das brauchen?“ Die ursprüngliche Aussage ist zur Gewissheit erstarrt, ohne je getestet worden zu sein.

Behandle jedes „wir brauchen“ als Hypothese. Woher wissen wir das? Wer hat es gesagt? Können wir das Verhalten beobachten? Können wir es mit dem kleinstmöglichen Experiment testen, bevor wir Wochen an Entwicklungszeit investieren?

## Bauchgefühl statt Schätzung

Lange Feedback-Schleifen erklären, warum Projekte vom Kurs abkommen. Aber bei der Schätzung werden viele Projekte schon zum Scheitern verurteilt, bevor die erste Zeile Code geschrieben ist.

Du sitzt in einem Planungsmeeting. Der Product Owner beschreibt ein Feature. Jemand sagt „wahrscheinlich eine Woche“. Jemand anderes sagt „eher drei Wochen“. Das Team einigt sich auf zwei, weil das in der Mitte liegt und sich vernünftig anfühlt. Niemand hat die Arbeit heruntergebrochen. Niemand hat die Unbekannten benannt. Die Schätzung ist ein sozialer Konsens, keine Analyse.

Daniel Kahneman und Amos Tversky haben das 1979 beschrieben und [Planungsfehlschluss (Planning Fallacy)](https://en.wikipedia.org/wiki/Planning_fallacy) genannt. Wenn Menschen Aufgaben schätzen, spielen sie instinktiv den besten Fall durch. Alles läuft glatt. Keine Krankheitstage, keine überraschenden Abhängigkeiten, keine Anforderungen, die sich mitten im Sprint ändern. Sie schätzen danach, wie es laufen _könnte_, nicht danach, wie es normalerweise läuft.

Erste Projektschätzungen können um den Faktor vier schwanken. Selbst die besten Schätzmodelle in der Forschung haben einen mittleren Fehler von 39 %. Wir schätzen nicht schlecht, weil wir nachlässig sind. Wir schätzen schlecht, weil unser Gehirn darauf gepolt ist, bei den eigenen Plänen optimistisch zu sein.

Bevor du also eine Zahl nennst, bring Licht in die dunklen Ecken. Welche Teile hast du schon einmal gebaut? Welche Teile sind wirklich neu? Wo gibt es Abhängigkeiten, die du nicht kontrollierst? In den Unbekannten steckt das Risiko, und das Risiko macht aus einer Schätzung von zwei Wochen eine Realität von zwei Monaten.

[Daten der Standish Group](https://opencommons.org/CHAOS_Report_on_IT_Project_Outcomes) bestätigen das: Kleine Projekte sind in rund 90 % der Fälle erfolgreich. Große Projekte in weniger als 10 %. Der Unterschied liegt nicht nur in der Komplexität. Große Projekte haben mehr Unbekannte, mehr Annahmen und mehr Stellen, an denen sich optimistische Schätzungen gegenseitig aufschaukeln.

Kahneman hat als Gegenmittel die sogenannte Referenzklassenprognose vorgeschlagen. Statt „Wie lange wird das dauern?“ fragst du „Wie lange haben ähnliche Dinge in der Vergangenheit gedauert?“. Schau dir an, was dein Team tatsächlich geliefert hat, nicht seine optimistischen Schätzungen. Nicht aufregend. Aber es funktioniert.

## Kleine Schritte, offene Augen

Erinnerst du dich an das Statusmeeting am Mittwochnachmittag? Jemand hätte es kommen sehen können – wenn die Feedback-Schleifen kürzer gewesen wären und die Schätzungen auf Belegen statt auf Hoffnung beruht hätten.

Lange Feedback-Schleifen lassen kleine Probleme zu großen werden. Ungeprüftes Vertrauen macht aus Meinungen wochenlang verschwendete Arbeit. Schätzungen nach Bauchgefühl machen den Zeitplan vom ersten Tag an zur Fiktion. Diese Muster erklären die meisten Terminüberschreitungen, die ich in 15 Jahren gesehen habe. Und die Antwort ist keine neue Methodik und kein besseres Tool. Sie heißt Disziplin. Validiere, bevor du baust. Teste kontinuierlich. Schätze auf Basis dessen, was tatsächlich passiert ist, nicht dessen, was du dir erhoffst.

Softwareentwicklung wird immer ein Spaziergang im Nebel bleiben. Aber wir können kleinere Schritte machen und öfter prüfen, ob wir festen Boden unter den Füßen haben. Die Projekte, die pünktlich fertig werden, sind nicht die mit perfekten Plänen. Es sind die, die gelernt haben, den Kurs zu korrigieren, bevor es zu spät war.
