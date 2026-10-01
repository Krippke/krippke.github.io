---
title: "Die Rolle des Iterierens"
excerpt: "Warum kleine, iterative Schritte besser sind als die große Auslieferung am Ende: was ich auf dem Weg zum agilen Entwickler gelernt habe, eine kurze Feedback-Schleife nach der anderen."
date: 2024-01-17 23:07:49 +0100
updated: 2024-01-17T23:08:32+01:00
teaser: /assets/images/busy-developer.jpg
tags: [software-development, agile, iteration, devops, productivity]
slug: die-rolle-des-iterierens
---

Erlebe Softwareentwicklung durch meine Augen. Von den ersten zögerlichen Schritten bis zu den Erfolgen von heute ist meine Geschichte geprägt von Erkenntnissen, Rückschlägen und entscheidenden Wendepunkten. Erfahre, wie ich mich vom unerfahrenen Entwickler zum agilen Denker entwickelt habe und dabei verstanden habe, wie wichtig kleine, iterative Schritte sind.

![Beschäftigter Entwickler, der an mehreren Aufgaben arbeitet](/assets/images/busy-developer.jpg)

Mein erstes großes Projekt begann zwei Jahre nach meinem Einstieg in die Softwareentwicklung. Gemeinsam mit meinem Projektleiter besprach ich die anstehenden Aufgaben, und nach und nach setzte ich die Features um. Damals arbeiteten wir ohne :series-link[automatisierte Tests]{slug="the-role-of-tests"} und ihre Vorteile. Deshalb zeigten sich die Probleme dieses Vorgehens erst relativ spät.

Schwierigkeiten gab es immer dann, wenn die entwickelten Features zum ersten Mal auf die späteren Nutzer trafen. Schnell zeigte sich, dass Annahmen vom Projektbeginn entweder missverstanden oder nicht vollständig berücksichtigt worden waren. Die fehlenden Informationen führten zu umfangreicher Nacharbeit, die im ursprünglichen Projektplan nicht vorgesehen war. Was bedeutet ungeplante Arbeit? Genau, eine stressige Zeit mit vielen Überstunden.

Die Überstunden waren Motivation genug, diese Probleme in meinen künftigen Projekten zu vermeiden. Die Idee war trügerisch einfach, im Rückblick aber falsch: Features wurden auf Basis der ursprünglichen Problemstellung und der Anforderungen umgesetzt. Im Einsatz bei den Endnutzern zeigte sich, dass bestimmte Aspekte in der Planungsphase nicht bedacht worden waren. Um das zu vermeiden, wurde die Planungsphase intensiver und detaillierter, damit nichts übersehen wurde. Diese Bemühungen beseitigten in den folgenden Projekten zwar die gröbsten Planungsfehler, am Ergebnis änderte sich aber im Kern nichts: Sobald die Nutzer mit den Features arbeiteten, tauchten weitere Aspekte auf, die umfangreiche Anpassungen nach sich zogen.

Mit der Zeit setzte sich die Erkenntnis fest, dass man nicht alles im Voraus wissen kann.
Softwareentwicklung ist wie ein Spaziergang im Nebel. Wir sehen nicht weit und schon gar nicht das Ziel. Wir müssen kleine Schritte machen und jedes Mal neu bewerten, worauf wir gestoßen sind und welchen Weg wir einschlagen wollen. Aber wie lässt sich das auf Softwareentwicklung übertragen?

Ein neuer Ansatz entstand: Statt die gesamte benötigte Funktionalität auf einmal umzusetzen, konzentrierten wir uns darauf, nur das absolut Notwendige zu implementieren, um den Kernnutzen zu liefern. Diese Teillösung präsentierten wir den Endnutzern, und die Erkenntnisse aus ihrem Feedback flossen direkt in die nächste Entwicklungsphase ein.

Bis dahin hatten wir nach einem Modell gearbeitet, bei dem zu Projektbeginn einmalig eine zentrale Entwicklungsinstanz aufgesetzt wurde. Diese lief so lange, wie der Kunde die entstandenen Anwendungen bei sich vor Ort betrieb. Wir bekamen jedoch ein Problem, als die wachsende Zahl an Präsentationen für Endnutzer dazu führte, dass die Entwicklung vorübergehend stillstehen musste. Das konnten wir uns auf Dauer nicht leisten. Also beschlossen wir, dass jeder Entwickler seine Funktionalität lokal umsetzt und sie dann schrittweise in die zentrale Entwicklungsinstanz integriert. Allerdings war die Zahl der Installationen inzwischen so stark gewachsen, dass das als zu aufwendig galt. Es war nicht praktikabel, dass ein Entwickler 4 Stunden damit verbringt, eine lokale Entwicklungsumgebung aufzusetzen, nur um ein kleines Feature zu entwickeln.

Das neue Ziel war klar: Eine lokale Entwicklungsumgebung sollte sich mit nur einem Befehl erstellen lassen. Zu meiner Überraschung gelang das relativ schnell. Mit der Zeit zeigten sich die positiven Effekte dieses Zustands. Jetzt war es mühelos möglich, kurzfristig eine Demo-Instanz aufzusetzen oder mit dem Kunden Tests durchzuführen. Viele Aufgaben, die vorher umständlich wirkten, gingen nun leicht von der Hand, denn eine Anwendung auf dem neuesten Entwicklungsstand war nur einen einfachen Befehl entfernt.

![Entwickler feiert den verbesserten Arbeitsablauf](/assets/images/celebrating-2.jpg)

Diese Erfahrung hat mir gezeigt, dass es sich lohnt, alles zu optimieren, was eine Entwicklungsiteration in die Länge zieht. Je schneller ich eine Iteration abschließen kann, desto effizienter bin ich und desto mehr schaffe ich in meiner Arbeitszeit. Als mir das klar wurde, konzentrierte ich mich darauf, die zeitaufwendigsten und ressourcenintensivsten Teile einer Entwicklungsiteration zu optimieren.

Ich kann mit Freude berichten, dass Überstunden nicht mehr zu meinem Arbeitsalltag gehören. Weil wir unsere Entwicklungsiterationen effizienter gemacht haben, können wir Erkenntnisse von Kunden nahtlos in die nächste Iteration einfließen lassen, ohne dafür viel Zeit aufwenden zu müssen. So bewegen wir uns in kleinen Schritten durch den Nebel und können mühelos die Richtung ändern, wenn es nötig ist.

## Fazit

Mein Vorgehen bei Softwareprojekten hat sich im Laufe der Zeit stark verändert. Anfangs lag der Fokus auf intensiver Planung. Die Erkenntnis, dass man unmöglich alles im Voraus wissen kann, führte dann zu einer agileren Arbeitsweise.

Mit einem iterativen Vorgehen, bei dem nur das Nötige umgesetzt wird, lässt sich früh auf das Feedback der Endnutzer reagieren und die Entwicklung entsprechend anpassen. Der Wechsel zu lokalen Entwicklungsumgebungen, die sich mit einem einzigen Befehl erstellen lassen, hat nicht nur den Entwicklern die Arbeit erleichtert, sondern auch flexiblere Präsentationen und Tests mit Kunden ermöglicht.

Die wichtigste Erkenntnis: Wer Prozesse kontinuierlich verbessert und die zeitaufwendigen Teile von Entwicklungsiterationen optimiert, arbeitet effizienter. Das hat nicht nur die Überstunden überflüssig gemacht, sondern auch die Fähigkeit verbessert, sich an Kundenanforderungen anzupassen. Das Bild vom Spaziergang durch den Nebel zeigt: Du kannst nicht alles im Voraus sehen, aber du kannst in kleinen Schritten vorankommen und flexibel die Richtung ändern.
