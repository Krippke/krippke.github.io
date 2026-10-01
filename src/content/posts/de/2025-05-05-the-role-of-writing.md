---
title: "Die Rolle des Schreibens"
excerpt: "Warum Schreiben die am meisten unterschätzte Fähigkeit von Entwicklern ist – klare Texte schärfen das Denken, verbreiten Wissen und werden im Zeitalter der LLMs zur Superkraft."
date: 2025-05-05 13:48:49 +0100
updated: 2025-05-05T20:13:47+02:00
teaser: /assets/images/typewriter.jpg
tags: [software-development, writing, productivity, career, llm, communication, workflow]
slug: die-rolle-des-schreibens
---

Hallo liebe Coder und Tastatur-Ninjas!

Wir kennen das alle, oder? Mittendrin im Code-Gefecht, die fünfte Tasse Kaffee wirkt, und der Bildschirm ist ein hypnotisches Kaleidoskop aus Klammern und Semikolons. Wir _lieben_ es, Probleme mit Code zu lösen. So sehr, dass wir manchmal ... na ja, alles andere vergessen. Vor allem das Schreiben.

<img src="/assets/images/typewriter.jpg">

Lange Zeit fühlte sich Schreiben an wie diese nervige Linter-Warnung, die man einfach mit `// eslint-disable-next-line` wegdrücken will. „Warum soll ich aufschreiben, was ich tue? Der Code ist die ultimative Wahrheit! Kommentare sind was für Anfänger, und Doku liest sowieso keiner!“ Kommt dir bekannt vor? Ich war dem „Code dokumentiert sich selbst“-Kult voll und ganz verfallen. Spoiler: Tut er nicht. Und das hat mich Zeit gekostet. Viel Zeit.

## Der Bug im Denkprozess: Wenn die Formulierung hakt

Mir ist etwas aufgefallen: Immer wenn ich versucht habe, eine Idee oder ein Konzept in Worte zu fassen (auch nur für mich selbst), und dabei ins Stolpern kam, lag das nicht nur an fehlendem Vokabular. Es war ein Bug-Report für meinen eigenen Denkprozess! Eine holprige Formulierung, ein Satz, der sich wie Spaghetti-Code anfühlte – das war ein klares Zeichen: **Der Gedanke selbst war noch nicht fertig kompiliert.**

Dieses Ringen um die richtigen Worte zwingt dich, die Idee zu debuggen. Du musst Variablen (Begriffe) klären, Funktionen (Zusammenhänge) definieren und die Architektur (die Struktur des Gedankens) überdenken. So lange, bis es sich „richtig“ anfühlt. Und siehe da: Wenn du eine Idee klar und verständlich _aufschreiben_ kannst, stehen die Chancen verdammt gut, dass sie konzeptionell tragfähig ist. Das ist wie ein grüner Unit-Test für dein Gehirn, _bevor_ du auch nur eine einzige Zeile Code committest.

## Vom Code-First-Junkie zum Konzept-Schreiber (eine Bekehrungsgeschichte)

Mein alter Workflow: Problem -> Koffein -> vage Idee im Kopf -> Hände auf die Tastatur -> draufloshämmern, bis es (angeblich) funktioniert. Das Problem? Oft habe ich erst gemerkt, dass meine grundlegende Annahme falsch war, als ich schon tief in der Dependency-Hölle steckte und versuchte, das letzte obskure Edge-Case-Monster zu bändigen. Solche konzeptionellen Fehler spät im Prozess zu finden und zu beheben, fühlte sich an, als wolle man das Fundament eines Hauses austauschen, während man schon die Dachziegel verlegt. Zeitaufwand: enorm. Frustlevel: `Integer.MAX_VALUE`.

Heute mache ich das anders. Problem -> Koffein -> **Konzept in Textform!** Ich versuche, die Lösung zuerst auf einer halben Seite Fließtext zu skizzieren. Und genau hier passiert die Magie: Wo kann ich etwas nicht klar formulieren? _Das_ sind die Schwachstellen. Ich iteriere über diesen Text und feile an den Formulierungen, bis er sich logisch und vollständig liest. Eine halbe Seite Text refactorst du in wenigen Minuten. Eine komplexe Codebasis? Frag lieber nicht ...

## LLMs: Mein neuer Pair-Programming-Partner (der schnell tippen kann)

Dieses „Write-First“-Prinzip hat sich als unbezahlbar erwiesen, besonders im Umgang mit unseren neuen Freunden, den Large Language Models. LLMs sind keine magischen Kristallkugeln, die Code aus dem Nichts zaubern (auch wenn es sich manchmal so anfühlt). Sie sind eher wie ein extrem belesener, blitzschneller Praktikant. Was sie brillant können: relevantes Wissen aus einem riesigen Datenbestand (im Grunde dem Internet) herausziehen und auf unsere _konkreten_ Anfragen zuschneiden.

Mein Ansatz: Ich _schreibe_ das übergeordnete Konzept, die Architektur, die Kernlogik – im Grunde den Bauplan und die wichtige Statik. Dann gebe ich diesen klaren, durchdachten Plan dem LLM und sage: „Okay, jetzt mal die Details aus. Generiere den Boilerplate-Code, recherchiere diese API-Einzelheiten, entwirf die Struktur der Dokumentation.“ Das „Ausmalen“ ist oft der zeitaufwendige Teil. Indem ich die klaren Strukturen vorgebe, überlasse ich dem LLM die Fleißarbeit. Effizienzgewinn? Auf jeden Fall! Aber nur, weil die Vorarbeit – das klare Denken und Schreiben – schon erledigt war. Ohne klaren Prompt bekommst du oft nur eloquenten Unsinn zurück. Garbage In, Garbage Out gilt auch für KI.

## Warum dein `System.out.println("Meeting outcome captured!");` nicht reicht

Seien wir ehrlich: Was in einem Meeting besprochen wird, ist oft schon Schnee von gestern, sobald der letzte Teilnehmer den Raum (oder den Zoom-Call) verlässt. „Hatten wir nicht vereinbart, das anders zu machen?“ Kommt dir bekannt vor? Das gesprochene Wort ist flüchtig, wie ein ungespeicherter Buffer. Und es skaliert miserabel. Versuch mal, zehn Leute auf denselben Stand zu bringen, indem du jedem einzeln die Geschichte erzählst.

Schreiben löst das. Ein gut formuliertes Dokument, ein klares Konzept, eine Architekturskizze in Textform – das bleibt. Es lässt sich teilen. Es ermöglicht asynchrone Zusammenarbeit. Neue Teammitglieder können sich einarbeiten. Entscheidungen sind nachvollziehbar. Das ist wie ein gut gepflegtes Git-Repository für Gedanken.

## Kopf frei: `git commit -m "Thought process checkpointed"`

Unser Gehirn ist großartig, aber wenn es um aktive Kontexte geht, ist es kein Mehrkern-Wunder mit unendlich RAM. Jeden Gedanken, jede offene Aufgabe, jede vage Idee im Kopf zu behalten, frisst mentale Kapazität. Kennst du das Gefühl, wenn dich um 3 Uhr nachts ein Detail aus Projekt X wach hält, obwohl du eigentlich an Projekt Y arbeiten sollst?

Aufschreiben ist wie ein `git commit` für deine Gedanken. Sobald du eine Idee, einen Plan oder ein Problem so weit aufgeschrieben hast, dass du weißt, du kannst den Faden später wieder aufnehmen, kann dein Gehirn loslassen. Es vertraut darauf, dass die Information sicher ist. Das schafft Platz! Das ist, als würdest du 50 Browser-Tabs schließen, weil du weißt, dass die Links in deinen Lesezeichen gespeichert sind. Aufgeschriebene Gedanken machen den Kopf frei und dich bereit für die nächste Herausforderung – oder zumindest für einen erholsameren Schlaf.

<img src="/assets/images/busy-minded-human.jpg">

## Vom Gedankenchaos zur Konzept-Leinwand

Eine unausgesprochene, nicht aufgeschriebene Idee ist wie ein Geist. Sie schwebt herum, vage, undefiniert. Du drehst dich gedanklich im Kreis und kommst nicht wirklich voran. Diese Idee zu formulieren und aufzuschreiben ist wie der erste Pinselstrich auf einer leeren Leinwand. Es ist der `mkdir my-new-project && cd my-new-project`-Moment für deine Kreativität.

Du legst die grundlegenden Strukturen fest. Du gibst der Idee eine Form. Und plötzlich siehst du nicht nur, was da ist, sondern auch, was fehlt. Du schaffst einen Rahmen, in dem sich neue, detailliertere Gedanken entfalten können. Ohne diesen ersten Schritt bleibt die Leinwand leer, und die Idee bleibt nur ein flüchtiger Einfall.

---

<img src="/assets/images/keys-not-just-for-coding.jpg">

Für mich hat sich das Schreiben von einer lästigen Pflicht in eine unverzichtbare Superkraft verwandelt. Es schafft **Klarheit**, spart **Zeit**, verbessert die **Zusammenarbeit**, verschafft **mentalen Freiraum** und wirkt als Katalysator für **Ideen**.

Meine Herausforderung an dich lautet also: Wenn du das nächste Mal vor einem kniffligen Problem stehst, widersteh dem Drang, sofort auf die Tastatur einzuhämmern. Nimm dir ein paar Minuten. Öffne einen einfachen Texteditor (oder schnapp dir Stift und Papier, du Rebell!). Versuch, die Lösung oder das Konzept in klare Worte zu fassen. Du wirst überrascht sein, wie viele Bugs du findest, bevor sie überhaupt zu Code werden.

Dein zukünftiges, weniger gestresstes Ich wird es dir danken (oder dich zumindest etwas seltener verfluchen). Happy Writing – und _dann_ Happy Coding!
