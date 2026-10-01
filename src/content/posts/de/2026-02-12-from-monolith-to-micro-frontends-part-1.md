---
title: "Vom Monolithen zu Micro Frontends: eine Schritt-für-Schritt-Anleitung – Teil 1"
excerpt: "Eine Schritt-für-Schritt-Anleitung für die Migration eines Frontend-Monolithen zu Micro Frontends: einen Shared Kernel herauslösen und dann das erste Modul in eine eigenständige SPA aufteilen."
date: 2026-02-12 12:00:00 +0100
updated: 2026-02-12T12:00:00+01:00
teaser: /assets/images/transforming-monolith.jpg
tags: [micro-frontends, frontend-architecture, monolith-migration, independent-deployment, micro-frontend-tutorial, conways-law]
slug: vom-monolithen-zu-micro-frontends-teil-1
---

Stell dir Folgendes vor. Du arbeitest in einem Team, das ein internes Firmenportal baut. Vier Features: News, Zeiterfassung, ein Mitarbeiterverzeichnis und ein Dashboard, das Daten aus allen dreien zusammenzieht. Drei Teams verantworten verschiedene Teile. Ein Repository. Jeder Pull Request ist ein Minenfeld. Du willst einen CSS-Fix für die News-Seite ausliefern, aber das Zeiterfassungs-Team hat gerade ein halbfertiges Feature gepusht und der Build ist rot. Deine Deployment-Pipeline braucht fünfzehn Minuten und alle stehen Schlange. Der Release-Tag fühlt sich an wie eine Geiselverhandlung.

Jetzt stell dir vor, jedes Team könnte seinen Teil des Portals unabhängig bauen, testen und deployen. Keine Abstimmung. Kein Warten. Keine gemeinsame Build-Warteschlange. Genau das versprechen Micro Frontends.

Das ist Teil eins einer zweiteiligen Serie. In diesem Beitrag bauen wir den Monolithen und gehen den ersten Schritt der Herauslösung: Wir spalten ein Modul in eine eigenständige Anwendung ab. In Teil zwei gehen wir tiefer, mit Komposition zur Laufzeit über browsernative Import Maps, Deployment in Produktion mit Docker und einem ehrlichen Blick darauf, wann sich dieser Ansatz die Komplexität nicht lohnt.

Alles in dieser Serie stützt sich auf ein [begleitendes Repository](https://github.com/Krippke/monolith-to-micro-frontends), in dem jeder Commit einen Architekturschritt abbildet. Klon es, schau dir die Commits an und mach mit.

## Was sind Micro Frontends überhaupt?

Der Begriff „Micro Frontends“ tauchte zum ersten Mal im November 2016 im [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar/techniques/micro-frontends) auf. Drei Jahre später veröffentlichte das Team von Martin Fowler den [grundlegenden Artikel](https://martinfowler.com/articles/micro-frontends.html), der dem Konzept seine maßgebliche Definition gab. Die Kernidee ist einfach: Man überträgt die Prinzipien von Microservices auf das Frontend. Statt einer monolithischen Frontend-Anwendung baust du unabhängig entwickelte, getestete und deployte UI-Module, die sich zu einem einzigen Produkt für den Nutzer zusammensetzen.

Stell es dir wie eine Zeitung vor. Sportteil, Wirtschaftsteil und Meinungsseite werden von getrennten Redaktionen geschrieben. Sie folgen gemeinsamen Gestaltungsrichtlinien – gleiche Schriften, gleiche Spaltenbreiten, gleicher Zeitungskopf. Aber jedes Ressort erscheint nach seinem eigenen Zeitplan. Der Leser sieht eine Zeitung.

Es gibt mehrere Wege, Micro Frontends zusammenzusetzen: Server-Side Includes, Integration zur Build-Zeit über npm-Pakete, iframes, Integration zur Laufzeit per JavaScript oder Web Components. Jeder hat seine Vor- und Nachteile. In dieser Serie konzentrieren wir uns auf zwei: **getrennte SPAs mit nginx-Routing** (der einfachste Ansatz) und **Einbettung zur Laufzeit über Import Maps** (der nahtloseste).

Bevor es um das Wie geht, ein Wort zum Warum. Conway's Law besagt, dass Organisationen Systeme entwerfen, die ihre Kommunikationsstrukturen widerspiegeln. Micro Frontends sind da keine Ausnahme. Wenn deine Organisation drei Teams mit klar getrennten fachlichen Verantwortungen hat, lassen Micro Frontends jedes Team seinen Teil von Anfang bis Ende verantworten. Wenn deine Organisation aus einem einzigen Team besteht, sind Micro Frontends vielleicht eine Lösung auf der Suche nach einem Problem. Die Forschung von McKinsey bestätigt das: Das Betriebsmodell – wie Teams aufgestellt sind, wie Governance gelebt wird – zählt genauso viel wie die Wahl der Technologie. Architektur folgt den Menschen, nicht umgekehrt.

## Zuerst den Monolithen bauen

Jedes gute Refactoring beginnt mit einem funktionierenden System. Der [erste](https://github.com/Krippke/monolith-to-micro-frontends/commit/88e84e6) und der [zweite](https://github.com/Krippke/monolith-to-micro-frontends/commit/622d68e) Commit im begleitenden Repository setzen das Acme Portal als klassischen Monolithen auf: eine einzige Vue-3-+-Quasar-+-Vite-Anwendung mit vier Seitenkomponenten, einer Vue-Router-Konfiguration und lokalen Datendateien, die eine Backend-API simulieren.

```
+--------------------------------------------------+
|              Acme Portal (Monolith)              |
|                                                  |
|  +----------+  +------------+  +--------------+  |
|  |   News   |  |    Time    |  |  Directory   |  |
|  |          |  |  Tracking  |  |              |  |
|  +----------+  +------------+  +--------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  |                Dashboard                   |  |
|  |   (aggregates News + Time + Directory)     |  |
|  +--------------------------------------------+  |
|                                                  |
|  Shared: employees.js, currentUser.js,           |
|          formatDate.js, portal.css               |
+--------------------------------------------------+
           Single build  |  Single deploy
```

Das ist ein bewusster Monolith, kein versehentlicher. Alle vier Module leben unter einem Dach, weil wir absichtlich hier anfangen. Aber stell dir vor, was passiert, wenn drei Teams beginnen mitzuarbeiten: Merge-Konflikte vervielfachen sich, gekoppelte Deploy-Zyklen bedeuten, dass der Bug eines Teams alle blockiert, und der Build wird mit jedem Feature langsamer.

Genau diese Schmerzpunkte adressieren Micro Frontends. Nicht jedes Projekt erreicht diese Schwelle. Aber wenn es so weit ist, fühlt sich der Monolith immer weniger wie ein Fundament an und immer mehr wie ein Flaschenhals.

## Schritt eins: einen Shared Kernel herauslösen

Bevor wir irgendetwas aufteilen, müssen wir herausfinden, was wirklich von allen Modulen gemeinsam genutzt wird. Im Acme Portal sind das das Datenmodell für Mitarbeiter, der Kontext des aktuellen Nutzers, Hilfsfunktionen zur Datumsformatierung und das Basis-Stylesheet.

Der [dritte Commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/5bdedd2) verschiebt diese Teile nach `@acme/common`, ein Yarn-Workspace-Paket. Das Monorepo hat jetzt eine Root-`package.json`, die Workspaces für `common/`, `orchestrator/` und die später folgenden Remotes definiert. Jedes Micro Frontend hängt zur Build-Zeit von diesem Paket ab.

Der Barrel-Export in `common/src/index.js` legt die öffentliche API fest: employees, currentUser, formatDate und Navigationslinks. Alles, was fachspezifisch ist – News-Artikel, Zeiteinträge –, bleibt im jeweiligen Modul.

Eine zentrale Designentscheidung an dieser Stelle: Der Shared Kernel ist eine **Abhängigkeit zur Build-Zeit**, kein Service zur Laufzeit. Jedes Micro Frontend bündelt seine eigene Kopie. Das vermeidet Kopplung zur Laufzeit, auf Kosten von etwas Duplizierung. In einem produktiven System würdest du dieses Paket mit Semver versionieren und Breaking Changes über deinen normalen Release-Prozess steuern.

## Der Ansatz mit getrennten SPAs: News herauslösen

Das einfachste Micro-Frontend-Muster ist, jedem Team seine eigene Single-Page-Application zu geben. Der [vierte Commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/09b3ebf) macht genau das: Das News-Modul wird zu `remote-news/`, einer eigenständigen Vue-+-Vite-App mit eigener `App.vue`, eigenem Router, eigenen Seiten und eigenen Daten.

```
                    Browser
                       |
             +---------+---------+
             |                   |
        /news/*           everything else
             |                   |
  +----------------+  +------------------+
  |  remote-news   |  |   orchestrator   |
  |  (standalone   |  |   (Dashboard,    |
  |   SPA)         |  |    Time,         |
  |                |  |    Directory)    |
  +----------------+  +------------------+
             |                   |
             +---------+---------+
                       |
                @acme/common
           (build-time dependency)
```

Die Navigation zwischen dem Orchestrator und der News-SPA läuft über einfache `<a href>`-Links. Ein Klick auf „News“ löst ein komplettes Neuladen der Seite aus. Die News-App rendert ihr eigenes Layout, ihre eigene Seitenleisten-Navigation, einfach alles selbst. Der einzige Integrationspunkt ist die URL.

Damit das funktioniert, führt der Orchestrator eine schlaue `NavigationLink`-Komponente ein. Sie prüft, ob eine Route zur aktuellen App gehört oder zu einer externen. Lokale Routen bekommen einen `<router-link>` für sofortige SPA-Navigation. Externe Routen bekommen einen `<a href>` für ein komplettes Neuladen der Seite. Gesteuert wird das über die Navigationskonfiguration in `@acme/common`, mit einem `app`-Feld an jedem Link.

**Die Vor- und Nachteile sind real.** Auf der Habenseite: völlige Unabhängigkeit. Jede SPA kann bei Bedarf ein anderes Framework nutzen. Deploys sind vollständig entkoppelt. Ein Absturz in News betrifft den Rest des Portals nicht. Auf der Sollseite: komplettes Neuladen der Seite bei jeder Navigation zwischen Apps. Kein gemeinsamer Anwendungszustand zur Laufzeit. Jede SPA rendert das gesamte Layout selbst, also flackert die Seitenleiste bei jedem Übergang. Die User Experience wirkt zusammengeflickt statt nahtlos.

Noch etwas ist erwähnenswert: `news.js` existiert jetzt sowohl im Orchestrator (für die Zusammenfassungs-Widgets im Dashboard) als auch in remote-news (für die vollständigen News-Seiten). Das Dashboard braucht zusammengefasste Daten, kann aber zur Laufzeit nichts aus einem Remote importieren. In einem echten System würden beide eine gemeinsame API aufrufen. In dieser Demo ist die Duplizierung beabsichtigt – und sie ist eine Design-Einschränkung, der du in der Praxis begegnen wirst.

## Was wir bisher haben – und was noch fehlt

Fassen wir zusammen. Wir haben mit einem Monolithen angefangen, gemeinsamen Code in ein Common-Paket herausgelöst und das News-Modul in eine eigene, unabhängig deployte SPA abgespalten. Der Ansatz mit getrennten SPAs löst das Problem der Deploy-Unabhängigkeit. Jedes Team kann nach seinem eigenen Zeitplan ausliefern. Aber er reißt eine Lücke in die User Experience. Jede Navigation zwischen Apps lädt die Seite komplett neu. Es gibt keinen gemeinsamen Zustand zur Laufzeit. Shell und Remote fühlen sich an wie zwei verschiedene Websites, die dasselbe CSS tragen.

Was wäre, wenn wir ein Micro Frontend direkt in die Shell des Orchestrators einbetten könnten? Dynamisch laden. In einen DOM-Container mounten. Wieder unmounten, wenn der Nutzer weiternavigiert. Alles ohne iframes, ohne Bündelung zur Build-Zeit, nur mit Funktionen, die jeder moderne Browser von Haus aus mitbringt.

Genau das bauen wir in Teil zwei: Import Maps, Komposition zur Laufzeit, Deployment mit Docker und das ehrliche Gespräch darüber, wann du Micro Frontends überhaupt nicht einsetzen solltest.
