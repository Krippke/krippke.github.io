---
title: "Warum du immer falschliegen musst"
excerpt: "Geh standardmäßig davon aus, dass du falschliegst: warum eine fest eingebaute Überprüfung mehr bringt als Selbstsicherheit und wie kurze Feedback-Schleifen finden, was du selbst nicht siehst."
date: 2026-02-19 12:00:00 +0100
updated: 2026-02-19T12:00:00+01:00
teaser: /assets/images/always-wrong.jpg
tags: [software-development, mindset, productivity, quality, career]
slug: warum-du-immer-falschliegen-musst
---

Vor zwölf Jahren hatte ich eine Aufgabe, an die ich bis heute regelmäßig denke. Wir mussten eine Reihe manueller, repetitiver Änderungen durch eine Codebasis ziehen. Nichts Besonderes. Jede Stelle finden, an der ein bestimmtes Muster vorkam, die Änderung anwenden, weiter. Die Feedback-Schleife war brutal. Fünfzehn bis zwanzig Minuten zwischen dem Deployment und dem Moment, in dem ich sah, ob ich etwas übersehen hatte. Also tat ich, was jeder sorgfältige Mensch tun würde. Ich ging den Code langsam und methodisch durch und prüfte jede gefundene Stelle dreifach. Ich war konzentriert und ich war mir sicher.

Ich deployte auf die Dev-Umgebung. Und da war es. Ich hatte Stellen übersehen. Keine obskuren, tief verschachtelten. Offensichtliche. Solche, bei denen ich auf den Bildschirm starrte und dachte: Wie konnte ich einfach daran vorbeilaufen?

Diese Frage hat mich länger beschäftigt als der Bug selbst. Ich hatte aufgepasst. Ich war nicht schlampig. Was war also passiert?

Nachdem ich eine Weile darüber nachgedacht hatte, wurde mir klar: Das Problem lag nicht in meinem Vorgehen. Es lag in meiner Annahme. Ich war davon ausgegangen, dass ich richtiglag. Ich hatte den Code nach einer Bestätigung abgesucht, dass ich alles erwischt hatte, statt aktiv nach dem zu jagen, was ich übersehen haben könnte. Mein Gehirn hatte schon entschieden, dass die Arbeit erledigt war. Es suchte nur noch nach der Erlaubnis, weiterzumachen.

An diesem Tag habe ich die Grundannahme geändert. Ich ging nicht mehr davon aus, dass ich richtiglag. Ich ging davon aus, dass ich falschlag. Und der Unterschied ist wie Tag und Nacht.

## Die Falle des Rechthabens

Für das, was mir passiert ist, gibt es einen Namen: [Bestätigungsfehler (Confirmation Bias)](https://en.wikipedia.org/wiki/Confirmation_bias).

1960 führte der Psychologe Peter Wason ein Experiment durch, das zu einem Grundpfeiler der Kognitionswissenschaft wurde. Er bat Teilnehmer, die Regel hinter einer Zahlenfolge herauszufinden. Ihre Hypothese konnten sie testen, indem sie neue Folgen vorschlugen. Was Wason herausfand, war aufschlussreich: Die Leute testeten fast ausschließlich Folgen, die ihre Vermutung bestätigen würden. Folgen, die sie hätten widerlegen können, probierten sie nicht aus. Dadurch wurden sie sich ihrer falschen Hypothesen immer sicherer.

Genau das macht dein Gehirn, wenn du davon ausgehst, dass du richtigliegst. Es hört auf, nach Belegen dafür zu suchen, dass du falschliegst. Es filtert selektiv. Es überspringt die Teile, die nicht passen. Dein Gehirn versucht, Energie zu sparen. Jede Information unvoreingenommen zu verarbeiten ist teuer, also nimmt es Abkürzungen. Dazu kommt: Falschliegen ist unangenehm. Es erzeugt kognitive Dissonanz und stellt dein Selbstbild infrage. Also weicht dein Gehirn dem aus.

Der [Dunning-Kruger-Effekt](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect) fügt eine weitere Ebene hinzu. Die Fähigkeiten, die du brauchst, um etwas gut zu machen, sind oft dieselben, die du brauchst, um zu beurteilen, ob du es gut gemacht hast. So entsteht ein blinder Fleck genau dort, wo du am dringendsten sehen müsstest. Du kannst nicht sehen, was du nicht sehen kannst.

Im großen Maßstab sind die Folgen hässlich. Ingenieure der NASA wussten [neun Jahre lang](https://en.wikipedia.org/wiki/Space_Shuttle_Challenger_disaster) vor der Katastrophe vom O-Ring-Problem der Raumfähre Challenger. Die Annahme, dass der redundante zweite Ring sie sicher genug machte, wurde nie ernsthaft hinterfragt. Sieben Menschen starben. Die Führung von Boeing [kam zu dem Schluss, die 737 MAX sei sicher](https://ethicsunwrapped.utexas.edu/engineering-ethics-and-the-boeing-scandal), selbst nach zwei Abstürzen, bei denen 346 Menschen ums Leben kamen. Die Titanic wurde als unsinkbar beworben, bevor sie auf ihrer Jungfernfahrt sank.

Das sind extreme Beispiele. Aber der Mechanismus ist derselbe, der mich bei diesen Code-Änderungen erwischt hat. Selbstsicherheit ersetzte Überprüfung. Niemand bemerkte es, bis es zu spät war.

## Dreh die Grundannahme um

Karl Popper hat eine ganze [Wissenschaftsphilosophie](https://plato.stanford.edu/entries/popper/) auf der Idee aufgebaut, dass es bei der wissenschaftlichen Methode nicht darum geht, Theorien als richtig zu beweisen. Es geht darum, sie zu widerlegen. Eine Theorie hat nur dann Wert, wenn sie widerlegbar ist. Du sammelst keine Belege, die deine Schlussfolgerung stützen. Du suchst nach Belegen, die sie zerstören. Was diesen Prozess übersteht, dem kannst du vertrauen.

Piloten haben das schon vor langer Zeit verstanden. Sie nutzen [Checklisten](https://pmc.ncbi.nlm.nih.gov/articles/PMC9246552/) nicht, weil sie die Schritte vergessen hätten. Sie nutzen sie, weil „Ich bin sicher, dass ich an alles gedacht habe“ genau die Art von Annahme ist, die Menschen das Leben kostet. Berührungskontrollen, gegenseitige Bestätigung durch beide Piloten und eine Fehlerkultur ohne Bestrafung ersetzten die alte Denkweise vom „unvermeidbaren menschlichen Versagen“. Die Unfallraten sanken deutlich.

Die Forschung zu [intellektueller Bescheidenheit](https://greatergood.berkeley.edu/article/item/five_reasons_why_intellectual_humility_is_good_for_you) erzählt aus Sicht der Psychologie eine ähnliche Geschichte. Menschen, die anerkennen, dass sie falschliegen könnten, treffen bessere Entscheidungen, lernen schneller und können viel besser einschätzen, was sie wissen und was nicht. Das hat [nichts mit Intelligenz zu tun](https://www.nature.com/articles/s44159-022-00081-9). Es ist eine eigene, trainierbare Fähigkeit. Kluge Menschen sind genauso anfällig für Selbstüberschätzung wie alle anderen.

Gary Kleins [Pre-Mortem-Technik](https://en.wikipedia.org/wiki/Pre-mortem) überträgt das auf die Teamebene. Bevor ein Projekt startet, stellt sich das Team vor, es sei bereits gescheitert. Dann arbeiten alle rückwärts, um herauszufinden, was schiefgelaufen ist. Indem Teams das Scheitern vorab annehmen, bringen sie Risiken ans Licht, die eine optimistische Planung begraben hätte. Das durchbricht Gruppendenken. Es erlaubt, Zweifel auszusprechen.

## Validieren, bevor du umsetzt

Nach diesem Tag vor zwölf Jahren habe ich meine Arbeitsweise umgebaut. Die Änderung war klein, aber sie hat alles verändert: Bevor ich darüber nachdenke, wie ich eine Aufgabe erledige, überlege ich, wie ich das Ergebnis validiere.

Der Prüfschritt kommt zuerst. Nicht als nachträglicher Gedanke, nicht als Häkchen, das ich setze, wenn ich fertig bin. Er ist das Erste, was ich entwerfe. Wenn ich nicht herausfinde, wie ich überprüfen kann, dass das Ergebnis korrekt ist, habe ich die Aufgabe noch nicht vollständig verstanden.

Das hat mein ganzes Verhältnis zu Fehlern umgekehrt. Ich fürchte sie nicht mehr. Ich erwarte sie. Jedes Arbeitsergebnis behandle ich als schuldig, bis seine Unschuld bewiesen ist. Ich suche gezielt nach den Stellen, an denen ich Mist gebaut habe, weil ich weiß, dass es sie gibt. Es gibt sie immer.

Meine Kollegen beschreiben mich manchmal als jemanden, der fehlerfrei arbeitet. Darüber muss ich schmunzeln, denn das Geheimnis ist genau das Gegenteil. Ich gehe jedes einzelne Mal davon aus, dass ich irgendwo einen Fehler gemacht habe. Dann suche ich ihn, bevor es jemand anderes tut. Es geht nicht darum, Angst vor Fehlern zu haben. Es geht darum, zu akzeptieren, dass du schon einen gemacht hast, und ihn zu suchen.

Und ich mache immer noch Fehler. Ein paarmal im Jahr rutscht etwas durch. Ehrlich gesagt beruhigt mich das. Es beweist, dass das System nicht auf der Illusion übermenschlicher Beständigkeit beruht. Es verschiebt nur die Chancen deutlich zugunsten davon, Fehler früh zu finden.

Damit das klar ist: Das ist kein Selbstzweifel. Ich zweifle nicht daran, ob ich die Arbeit kann. Ich hinterfrage das Ergebnis. Selbstzweifel lähmt. Systematischer Zweifel ist produktiv. Der eine sagt: „Vielleicht kann ich das nicht.“ Der andere sagt: „Wahrscheinlich habe ich irgendwo einen Fehler gemacht, also suche ich ihn.“

## Falschliegen, um richtigzuliegen

Hier steckt ein leises Paradox. Die Menschen, die davon ausgehen, dass sie falschliegen, liegen am Ende am häufigsten richtig. Sie überprüfen. Sie kontrollieren. Sie jagen den Fehler, statt zu hoffen, dass es ihn nicht gibt.

Der Wechsel der Denkweise passt in einen Satz. Hör auf zu fragen „Habe ich das richtig gemacht?“ und frag stattdessen „Wo habe ich Mist gebaut?“

Wenn du das nächste Mal eine Arbeit abschließt, widersteh dem Drang, gleich weiterzumachen. Nimm dir fünf Minuten und versuch, kaputtzumachen, was du gerade gebaut hast. Such den Grenzfall, an den du nicht gedacht hast. Lies die Anforderung noch einmal, die du verstanden zu haben glaubst. Hinterfrage die Annahme, die du auf Autopilot getroffen hast.

Dort liegt die echte Qualität. Nicht im Rechthaben. Sondern darin, dir selbst nachzuweisen, dass du falschliegst.
