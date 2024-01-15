---
layout: single
title: "The role of iterating"
header:
  teaser: /assets/images/struggling-developer.jpg
---

Tell the story of how you started developing and how the first few projects went.
Focus on the time it took to get the first insights into the problem domain and how this affected the schedule.

Tell what you tried to do to improve your performance. The first attempt was to define everything in detail in advance. But this led to minimal success. The change came when you realised that you can't define everything in advance. You have to start with the project, with a rough framework of the problem domain. The insights come along the way.

As we tried to iterate faster, the way we optimised changed. The focus was on identifying what was taking time during an iteration and working on those items to reduce iteration time.

Changes made - goals:

- A local development environment must be available by running a command.
- Communication with other systems must be verifiable by a single command.
- A new project member must receive all project-related information in the project's `doc/` folder.

Mein erstes größeres Projekt begann zwei Jahre nachdem ich mit der Software Entwicklung begonne hatte. Zusammen mit meinem Projektleiter haben wir uns über die zu lösenden Aufgaben unterhalten und ich habe nach und nach die Funktionen umgesetzt. Damals natürlich noch komplett ohne automatisierte Tests und deren Vorteile, haben sich die Probleme mit diesem Ansatz erst verhältnismäßig spät gezeigt.

Die Probleme fingen immer dann an, wenn die gebauten Funktionen das erste mal auf die künftigen Nutzer stießen. Recht schnell stellte sich heraus, dass Annahmen die am Anfang des Projektes getroffen wurden, entweder falsch verstanden oder nicht vollumfänglich betrachten worden waren.
Die Auswirkungen dieser fehlenden Informationen waren aufwändige Umbauarbeiten die natürlich in der initialen Zeitschiene des Projektes nicht berücksichtigt waren. Was bedeuten Arbeiten die nicht eingeplant waren? Richtig, eine stressige Zeit mit vielen Überstunden.

Die Überstunden waren Antrieb genug, bei meiner künnftigen Arbeit diesen Problemen zu entgehen.
Die Idee war denkbar einfach wenndoch aus heutiger Sicht falsch: Die Funktionen wurden aufgrund der initialen Problemstellung und Anforderungen umgesetzt. Bei der Nutzung durch die Anwender stellt sich heraus, dass gewissen Aspekte bei der Planung nicht berücksichtigt worden waren. Um diesem Problem zu entgehen, wird die Planungsphase intensiver und detaillierter durchgeführt um möglichst nichts zu vergessen. Die Anstrengungen in dieser Richtung haben zwar im Verlauf weiterer Projekte die gröbsten Planungsfehler behoben, jedoch war das Ergebnis prinzipiell das selbe: Sobald die Nutzer die Funktionen das erste mal Nutzten kamen weitere Aspekte zum Vorschein und aufwändige Anpassungen waren die Folge.

Mit der Zeit festigte sich der Gedanke, dass es nicht möglich ist, alles im Vorfeld zu wissen.
Softwareentwicklung ist wie im Nebel zu laufen. Wir sehen nicht weit und schon gar nicht das Ende. Wir müssen in kleinen Schritten voranschreiten und jedes mal aufs neue Bewerten was uns begegnet ist und welchen Weg wir weiter verfolgen. Doch wie kann ich das auf die Softwareentwicklung übertragen?

Der nächste Ansatz war entstanden: Vom gesamten Umfang der benötigten Funktionen wird nur das notwendigste umgesetzt um den Kernmehrwert abzubilden. Dies wird den Endnutzern vorgestellt und die Erkenntnisse aus dem Feedback der Nutzer fließt in die nächste Entwicklungsrunde mit ein.

Bis zu diesem Zeitpunkt haben wir ein Modell mit einer zentralen Entwicklungsinstanz verfolgt.
Diese wurde einmalig zu Beginn des Projektes aufgesetzt und lief solange der Kunde die erstellten Anwendungen bei sich betrieb. Wir standen nun vor dem Problem, dass mit den vermehrten Vorstellungsrunden bei den Endnutzern die Entwicklung in dieser Zeit still stehen musste. Dies konnten wir uns auf dauer nicht leisten. Die Entwicklung musste auch während dieser Vorstellungsslots parallel weiter gehen. Also entschlossen wir uns, dass jeder Entwickler seine Funktionen lokal umsetzt und diese dann nach und nach auf der Entwicklungsinstanz integriert werden. Nun hatte sich damit die Anzahl an Installationen soweit vermehrt, dass diese als zu Aufwendig betrachtet wurde. Ein Entwickler kann nicht 4 Stunden aufwenden um eine lokale Entwicklungsumgebung zu erstellen nur damit ein kleines Feature erstellt werden kann.

Das neue Ziel war klar: Eine lokale Entwicklungsumgebung muss mit nur einem Kommando erstellt werden können. Diese Ziel war zu meiner verwunderung verhältnissmäßig schnell erreicht. Die positiven Auswirkungen dieses Zustandes sind uns erst mit der Zeit aufgefallen. Mal kurz eine Demo-Instanz erstellen, kein Problem. Mal kurz etwas mit dem Kunden testen, kein Problem. Wir konnten vieles was zuvor als zu Aufwändig erschien nun machen, da eine Anwendung mit aktuellem Entwicklungsstand nur ein Commando entfernt war.

Diese Erfahrung zeigte mir, dass es sich lohnt, alles was zu einer Verlängerung einer Iteration beiträgt zu verbessern. Je schneller ich in der Lage bin eine Entwicklungsiteration durchzuführen, desto effizienter bin ich und folglich kann ich in meiner Arbeitszeit mehr leisten. Nachdem mir diese Erkenntnis bewusst wurde, richtete ich meinen Fokus auf die Optimierung von Themen, die in einer Entwicklungsiteration zeitaufwändig und anspruchsvoll sind.

Es freut mich zu sagen, dass Überstunden mittlerweile nicht mehr zu meinem Arbeitsalltag gehören. Durch gezielte Optimierungen bezüglich der Effizienz unserer Entwicklungsiterationen sind wir in der Lage, die Erkenntnisse aus der Kundennutzung nahtlos in die nächste Iteration einzubinden, ohne dabei aufwändige zeitliche Ressourcen zu beanspruchen. Wir können uns nun in kleinen Schritten durch den Nebel bewegen und bei Bedarf Problemlos die Richtung wechseln. 