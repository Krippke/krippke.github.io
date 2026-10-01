---
title: "Micro Frontends mit Import Maps: die leichtgewichtige Alternative zu Module Federation – Teil 2"
excerpt: "Micro Frontends zur Laufzeit mit Import Maps zusammensetzen – eine leichtgewichtige, browsernative Alternative zu Module Federation. Kein Neuladen der Seite, keine iframes."
date: 2026-02-28 12:00:00 +0100
updated: 2026-02-28T12:00:00+01:00
teaser: /assets/images/transit-map.jpg
tags: [micro-frontends, import-maps, module-federation, runtime-composition, micro-frontend-tutorial, docker-deployment]
slug: vom-monolithen-zu-micro-frontends-teil-2
---

In Teil eins haben wir ein monolithisches Firmenportal gebaut, einen Shared Kernel extrahiert und das News-Modul als eigenständige SPA abgespalten. Das hat funktioniert. Jedes Team konnte unabhängig deployen. Aber jede Navigation von einer App zur anderen hat die ganze Seite neu geladen. Shell und Remote fühlten sich an wie zwei verschiedene Websites.

Jetzt gehen wir das schwierigere Problem an: ein Micro Frontend zur Laufzeit in die Host-Anwendung einbetten. Kein Neuladen der Seite. Keine iframes. Kein frameworkspezifischer Klebecode. Nur ein natives Browser-Feature namens Import Maps.

## Import Maps in 60 Sekunden

Eine Import Map ist ein JSON-Block in einem `<script type="importmap">`-Tag. Sie sagt dem Browser: Wenn im JavaScript-Code `import('remote-time')` steht, lade das Modul von dieser URL, statt es als relativen Pfad aufzulösen.

```html
<script type="importmap">
  {
    "imports": {
      "remote-time": "http://localhost:9002/remote-time.js"
    }
  }
</script>
```

Das ist der gesamte Mechanismus. Kein Bundler-Plugin. Kein Build-Schritt. Keine Laufzeitbibliothek. Der Browser liest die Map, und jeder Bare Module Specifier in deinem Code wird zu der URL aufgelöst, die du angegeben hast.

Die Browserunterstützung lag Ende 2025 weltweit bei etwa 94,5 %. Chrome, Edge, Firefox und Safari unterstützen Import Maps nativ. Die verbleibende Lücke sind ältere mobile Browser, die du bei Bedarf mit Polyfills wie [es-module-shims](https://github.com/guybedford/es-module-shims) abdecken kannst.

Warum ist das wichtig? Import Maps sind ein **Grundbaustein der Webplattform**. Sie sind kein Framework, keine Bibliothek und kein Produkt eines Build-Tool-Herstellers. Sie sind Teil der HTML-Spezifikation. Kein Lock-in. Kein Laufzeit-Overhead. Der Browser erledigt die Arbeit.

## Ein Micro Frontend mit Mount/Unmount bauen

Der [fünfte Commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/41a232f) extrahiert das Zeiterfassungsmodul nach `remote-time/`. Anders als das News-Modul (das zu einer vollständigen SPA wurde) wird die Zeiterfassung aber als **Bibliothek** im Library Mode von Vite gebaut. Das Ergebnis ist ein einzelnes ES-Modul: `remote-time.js`.

Der Einstiegspunkt definiert den gesamten öffentlichen Vertrag – zwei Funktionen:

```javascript
let app = null

export function mount(el) {
  app = createApp(TimeTrackingPage)
  app.use(Quasar)
  app.mount(el)
}

export function unmount() {
  if (app) {
    app.unmount()
    app = null
  }
}
```

`mount` nimmt ein DOM-Element entgegen, erzeugt eine Vue-App und rendert sie hinein. `unmount` baut sie wieder ab. Der Orchestrator weiß nie, welches Framework das Remote verwendet. Er kennt nur den Vertrag.

Auf der Host-Seite ist `RemoteTimeHost.vue` ein dünner Wrapper:

```vue
<template>
  <q-page padding>
    <div ref="containerRef"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)
let unmountRemote = null

onMounted(async () => {
  const { mount, unmount } = await import('remote-time')
  mount(containerRef.value)
  unmountRemote = unmount
})

onUnmounted(() => {
  if (unmountRemote) unmountRemote()
})
</script>
```

Wenn der Nutzer zu `/time` navigiert, mountet Vue `RemoteTimeHost`. Die Komponente importiert `remote-time` dynamisch (aufgelöst über die Import Map), ruft `mount` mit einem Container-Element auf und merkt sich die `unmount`-Funktion zum Aufräumen. Der Nutzer sieht, wie die Zeiterfassungsseite in der Shell des Orchestrators erscheint – gleiche Sidebar, gleicher Header, kein Neuladen.

```
+--------------------------------------------------+
|              Orchestrator Shell                  |
|  (layout, navigation, routing)                   |
|                                                  |
|  /          -> Dashboard (local)                 |
|  /directory -> Employee Directory (local)        |
|  /time      -> RemoteTimeHost.vue                |
|                  |                               |
|                  | import('remote-time')         |
|                  |   resolved via import map     |
|                  v                               |
|         +------------------+                     |
|         | remote-time.js   |                     |
|         | mount(el)        |                     |
|         | unmount()        |                     |
|         +------------------+                     |
+--------------------------------------------------+
```

**Der Knackpunkt ist Entwicklung gegenüber Produktion.** In der Entwicklung zeigt die Import Map in `index.html` direkt auf `http://localhost:9002/remote-time.js` – den Vite-Dev-Server, der das Remote auf einem anderen Port ausführt. Der Dependency Optimizer von Vite versteht aber keine Import Maps. Er würde versuchen, `remote-time` zu bundeln, und scheitern. Deshalb nutzt der Orchestrator ein eigenes Vite-Plugin, das den Bare Specifier `remote-time` abfängt, ihn als extern markiert und stattdessen auf die URL des Dev-Servers zeigen lässt:

```javascript
{
  name: 'import-map-externals',
  enforce: 'pre',
  resolveId(source) {
    if (source === 'remote-time') {
      return { id: 'http://localhost:9002/src/main.js', external: true }
    }
  },
}
```

In der Produktion externalisiert Rollup den Specifier beim Build, und die native Import Map des Browsers übernimmt. Dieselbe `import('remote-time')`-Anweisung im Quellcode, zwei völlig unterschiedliche Auflösungsmechanismen, je nach Umgebung.

## Produktiv-Deployment mit Docker Compose

Der [sechste Commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/0a5bafb) ergänzt ein vollständiges Produktions-Setup: vier Docker-Container, orchestriert von Docker Compose, mit einem nginx-Reverse-Proxy davor.

```
                Browser :8080
                     |
               nginx proxy
                     |
        +------------+------------+
        |            |            |
        v            v            v
  orchestrator  remote-news  remote-time
     (:80)        (:80)        (:80)
```

Jedes Micro Frontend hat ein eigenes Multi-Stage-Dockerfile: einen Node-22-alpine-Container zum Bauen und einen nginx-alpine-Container zum Ausliefern. Jedes lässt sich unabhängig bauen und deployen.

Der nginx-Reverse-Proxy übernimmt das Routing, und hier wird es subtil. Schau dir die `default.conf` an:

```nginx
location = /time {
    proxy_pass http://orchestrator:80;
}

location /time/ {
    proxy_pass http://remote-time:80;
}
```

`/time` (exakter Treffer, ohne abschließenden Slash) geht an den **Orchestrator**. Warum? Weil `/time` eine Route im Vue Router des Orchestrators ist. Der Browser lädt die Shell des Orchestrators, die `RemoteTimeHost.vue` rendert, das wiederum das remote-time-Modul dynamisch importiert.

`/time/` (Präfix-Treffer, mit abschließendem Slash) geht an den **remote-time-Container**. Warum? Weil die Import Map `remote-time` zu `/time/remote-time.js` auflöst. Dieser Request passt auf das Präfix `/time/` und landet bei dem Container, der die JavaScript-Datei tatsächlich ausliefert.

Ein Zeichen. Völlig anderes Verhalten. Das ist subtil, aber korrekt, und genau solche Details entscheiden darüber, ob ein Micro-Frontend-Deployment funktioniert oder scheitert.

**Noch etwas zur Produktion.** Das Dockerfile des Orchestrators enthält diese Zeile:

```bash
sed -i 's|http://localhost:9002/remote-time.js|/time/remote-time.js|g' \
  orchestrator/dist/spa/index.html
```

Sie schreibt die URL in der Import Map von der localhost-Adresse der Entwicklung auf den relativen Pfad der Produktion um. Für eine Demo reicht das. Aber es ist fragil – es bricht stillschweigend, wenn sich das HTML-Format ändert, und es skaliert schlecht auf mehrere Remotes. In einem echten System würdest du die Import Map beim Deployment über Umgebungsvariablen oder einen Konfigurations-Endpoint einspeisen.

## Zwei Ansätze im Vergleich

Wir haben jetzt beide Micro-Frontend-Muster in Aktion gesehen. So schneiden sie im Vergleich ab:

|                         | Separate SPA (News)        | Import Map (Time)            |
|-------------------------|----------------------------|------------------------------|
| Navigation              | Neuladen der ganzen Seite  | Wie in einer SPA, nahtlos    |
| Gemeinsame Shell        | Nein (eigenes Layout)      | Ja (Layout des Hosts)        |
| Kopplung zur Laufzeit   | Keine                      | mount/unmount                |
| Unabhängiges Deployment | Vollständig                | Vollständig                  |
| Nutzererlebnis          | Zusammengestückelt         | Nahtlos                      |
| Komplexität             | Gering                     | Mittel                       |
| Fehlerisolation         | Vollständig                | Teilweise (gemeinsames DOM)  |

Keiner der beiden Ansätze ist grundsätzlich besser. Die richtige Wahl hängt von der Beziehung zwischen Modul und Host ab.

**Separate SPAs** passen am besten, wenn das Modul ein wirklich eigenständiger Ablauf ist. Der Nutzer wechselt beim Betreten gedanklich den Kontext. Denk an Einstellungen, einen Admin-Bereich oder ein Hilfe-Center. Das Neuladen der ganzen Seite ist hier akzeptabel, weil der Nutzer eine andere Umgebung erwartet.

**Einbetten per Import Map** passt am besten, wenn das Modul ein Bereich innerhalb einer größeren Shell ist. Der Nutzer erwartet eine gemeinsame Navigation, ein einheitliches Layout und einen nahtlosen Ablauf. Denk an ein Dashboard-Widget, einen Tab in einem Portal oder einen Schritt in einem mehrstufigen Workflow.

## Die ehrliche Wahrheit: Wann du auf Micro Frontends verzichten solltest

Hier ist eine Zahl, bei der du innehalten solltest. Die Verbreitung von Micro Frontends in der Branche ist zwischen dem Höhepunkt des Hypes und heute von 75,4 % auf 23,6 % gefallen. Das ist keine Geschichte des Scheiterns. Es ist eine gesunde Marktkorrektur. Teams haben das Muster begeistert ausprobiert, den Overhead bemerkt und sich auf einen pragmatischen Einsatz zurückgezogen.

Aus eigener Erfahrung sind die zwei größten Gewinne von Micro Frontends **unabhängige Deploybarkeit** und **Teamautonomie**. Wenn jedes Team nach eigenem Zeitplan ausliefern kann, ohne Releases abzustimmen, und wenn jedes Team seinen Stack von oben bis unten selbst verantwortet, dann ist der organisatorische Nutzen echt und greifbar.

Das gilt aber auch für die Kosten. **Infrastruktur-Overhead** ist der stille Killer. Nginx-Routingregeln, Docker-Orchestrierung, Verwaltung der Import Maps, Versionierung des Shared Kernels, CI/CD mit mehreren Pipelines – all das ist operativer Ballast, den ein Monolith schlicht nicht mit sich herumträgt. Und dann ist da noch die Falle der **verfrühten Einführung**: Teams greifen zu Micro Frontends, bevor sie überhaupt die Probleme haben, die das Muster löst. Wenn ihr ein einzelnes Team mit einer einzigen Deploy-Pipeline seid, fügt ihr Komplexität hinzu, ohne irgendetwas zu gewinnen.

Bevor du Micro Frontends einführst, beantworte diese Fragen ehrlich:

1. Arbeitet mehr als ein Team am Frontend?
2. Blockieren sich diese Teams gegenseitig mit ihren Deploy-Zeitplänen?
3. Haben die Module wirklich klar getrennte fachliche Grenzen?
4. Seid ihr bereit, in die nötige Infrastruktur und operative Reife zu investieren?

Wenn die Antwort auf eine dieser Fragen „nein“ lautet, fährst du mit einem gut strukturierten Monolithen mit klaren Modulgrenzen und einer gemeinsamen Komponentenbibliothek besser – bei einem Bruchteil der Komplexität.

Noch eine letzte Sache. Conway's Law wirkt in beide Richtungen. Micro Frontends lösen keine organisatorischen Probleme. Sie zementieren sie. Wenn eure Teams keine klaren fachlichen Grenzen haben, entstehen diese Grenzen nicht dadurch, dass ihr das Frontend aufteilt – ihr verteilt die Verwirrung nur auf mehr Repositories.

## Fazit

In diesen zwei Beiträgen sind wir den ganzen Weg gegangen: Monolith, Shared Kernel, separate SPA, Einbetten per Import Map, Produktiv-Deployment. Jeder Schritt im [begleitenden Repository](https://github.com/Krippke/monolith-to-micro-frontends) ist ein einzelner Commit, den du auschecken und ausführen kannst.

Die wichtigste Erkenntnis: Micro Frontends sind zuerst ein organisatorisches Werkzeug und erst danach ein technisches. Die Architektur sollte der Teamstruktur folgen, nicht umgekehrt. Wenn eure Teams getrennte Domänen, unabhängige Release-Rhythmen und die operative Reife für verteilte Infrastruktur haben, bringen Micro Frontends echtes Tempo. Wenn nicht, ist ein sauberer Monolith kein Kompromiss – er ist die richtige Antwort.

Klon das Repo. Führ `docker compose up -d` aus. Schau dich um. Und bevor du zum Micro-Frontend-Hammer greifst, stell sicher, dass du wirklich einen Nagel vor dir hast.
