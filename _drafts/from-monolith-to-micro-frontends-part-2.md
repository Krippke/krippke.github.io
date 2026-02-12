---
layout: single

title: "Micro Frontends with Import Maps: The Lightweight Alternative to Module Federation - Part 2"
date: 2026-02-08 12:00:00 +0100
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/transit-map.jpg
tags:
  [
    micro frontends,
    import maps,
    module federation,
    runtime composition,
    micro frontend tutorial,
    docker deployment,
  ]
---

In part one, we built a monolithic company portal, extracted a shared kernel, and split the News module into its own standalone SPA. It worked. Each team could deploy independently. But every cross-app navigation was a full page reload. The shell and the remote felt like two different websites.

Now we tackle the harder problem: embedding a micro frontend inside the host application at runtime. No page reloads. No iframes. No framework-specific glue. Just a browser-native feature called import maps.

## Import Maps in 60 Seconds

An import map is a JSON block inside a `<script type="importmap">` tag. It tells the browser: when JavaScript code says `import('remote-time')`, fetch it from this URL instead of trying to resolve it as a relative path.

```html
<script type="importmap">
  {
    "imports": {
      "remote-time": "http://localhost:9002/remote-time.js"
    }
  }
</script>
```

That is the entire mechanism. No bundler plugin. No build step. No runtime library. The browser reads the map, and every bare module specifier in your code resolves to the URL you specified.

Browser support sits at roughly 94.5% globally as of late 2025. Chrome, Edge, Firefox, and Safari all support it natively. The remaining gap is older mobile browsers, which you can cover with polyfills like [es-module-shims](https://github.com/guybedford/es-module-shims) if needed.

Why does this matter? Import maps are a **web platform primitive**. They are not a framework, not a library, not a build tool vendor. They are part of the HTML spec. No lock-in. No runtime overhead. The browser does the work.

## Building a Mount/Unmount Micro Frontend

The [fifth commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/41a232f) extracts the Time Tracking module into `remote-time/`. But unlike the News module (which became a full SPA), Time Tracking is built as a **library** using Vite's library mode. The output is a single ES module: `remote-time.js`.

The entry point defines the entire public contract -- two functions:

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

`mount` takes a DOM element, creates a Vue app, and renders into it. `unmount` tears it down. The orchestrator never knows what framework the remote uses. It only knows the contract.

On the host side, `RemoteTimeHost.vue` is a thin wrapper:

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

When the user navigates to `/time`, Vue mounts `RemoteTimeHost`. The component dynamically imports `remote-time` (resolved via the import map), calls `mount` with a container element, and stores the `unmount` function for cleanup. The user sees the time tracking page appear inside the orchestrator's shell -- same sidebar, same header, no reload.

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

**The nuance here is dev versus production.** During development, the import map in `index.html` points directly to `http://localhost:9002/remote-time.js` -- the Vite dev server running the remote on a different port. But Vite's dependency optimizer does not understand import maps. It would try to bundle `remote-time` and fail. So the orchestrator uses a custom Vite plugin that intercepts the bare `remote-time` specifier and marks it as external, pointing to the dev server URL instead:

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

In production, Rollup externalizes the specifier during the build, and the browser's native import map takes over. Same `import('remote-time')` statement in the source code, two completely different resolution mechanisms depending on the environment.

## Production Deployment with Docker Compose

The [sixth commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/0a5bafb) adds a complete production setup: four Docker containers orchestrated by Docker Compose, fronted by an nginx reverse proxy.

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

Each micro frontend has its own multi-stage Dockerfile: a Node 22-alpine container for building, and an nginx-alpine container for serving. Each is independently buildable and deployable.

The nginx reverse proxy does the routing, and here is where it gets subtle. Look at the `default.conf`:

```nginx
location = /time {
    proxy_pass http://orchestrator:80;
}

location /time/ {
    proxy_pass http://remote-time:80;
}
```

`/time` (exact match, no trailing slash) routes to the **orchestrator**. Why? Because `/time` is a route in the orchestrator's Vue Router. The browser loads the orchestrator shell, which renders `RemoteTimeHost.vue`, which then dynamically imports the remote-time module.

`/time/` (prefix match, with trailing slash) routes to the **remote-time container**. Why? Because when the import map resolves `remote-time` to `/time/remote-time.js`, that request matches the `/time/` prefix and gets routed to the container that actually serves the JavaScript file.

One character. Entirely different behavior. This is subtle but correct, and it is the kind of detail that makes or breaks a micro frontend deployment.

**One more thing about production.** The orchestrator's Dockerfile contains this line:

```bash
sed -i 's|http://localhost:9002/remote-time.js|/time/remote-time.js|g' \
  orchestrator/dist/spa/index.html
```

This rewrites the import map URL from the development localhost address to the production-relative path. It works for a demo. But it is brittle -- it breaks silently if the HTML format changes, and it does not scale well to multiple remotes. In a real system, you would inject the import map at deployment time via environment variables or a configuration endpoint.

## Two Approaches Side by Side

We have now seen both micro frontend patterns in action. Here is how they compare:

|                     | Separate SPA (News) | Import Map (Time)   |
|---------------------|---------------------|---------------------|
| Navigation          | Full page reload    | SPA-style, seamless |
| Shared shell        | No (own layout)     | Yes (host layout)   |
| Runtime coupling    | None                | mount/unmount       |
| Deploy independence | Full                | Full                |
| User experience     | Stitched            | Seamless            |
| Complexity          | Low                 | Medium              |
| Failure isolation   | Complete            | Partial (shared DOM)|

Neither approach is universally better. The right choice depends on the relationship between the module and the host.

**Separate SPAs** work best when the module is a truly independent journey. The user mentally context-switches when they enter it. Think: a settings panel, an admin area, a help center. The full page reload is acceptable because the user expects a different environment.

**Import map embedding** works best when the module is a panel inside a larger shell. The user expects shared navigation, a consistent layout, and a seamless flow. Think: a dashboard widget, a tab in a portal, a step in a multi-step workflow.

## The Honest Truth: When Not to Use Micro Frontends

Here is a number that should make you pause. Industry adoption of micro frontends dropped from 75.4% to 23.6% between peak hype and today. That is not a failure story. It is a healthy market correction. Teams tried the pattern enthusiastically, discovered the overhead, and pulled back to pragmatic adoption.

From personal experience, the two biggest wins of micro frontends are **independent deployability** and **team autonomy**. When each team can ship on their own schedule without coordinating releases, and when each team owns their stack top to bottom, the organizational benefits are real and tangible.

But so are the costs. **Infrastructure overhead** is the silent killer. Nginx routing rules, Docker orchestration, import map management, shared kernel versioning, multi-pipeline CI/CD -- all of this is operational weight that a monolith simply does not carry. And then there is the trap of **premature adoption**: teams reaching for micro frontends before they actually have the problems the pattern solves. If you are a single team with a single deploy pipeline, you are adding complexity for zero benefit.

Before adopting micro frontends, answer these honestly:

1. Do you have more than one team contributing to the frontend?
2. Are those teams blocked on each other's deploy schedules?
3. Do the modules have genuinely distinct domain boundaries?
4. Are you willing to invest in the infrastructure and operational maturity required?

If the answer to any of these is "no," a well-structured monolith with clear module boundaries and a shared component library will serve you better with a fraction of the complexity.

One last thing. Conway's Law cuts both ways. Micro frontends do not fix organizational problems. They encode them. If your teams do not have clear domain boundaries, splitting the frontend will not create those boundaries -- it will just distribute the confusion across more repositories.

## Wrapping Up

Over these two posts, we walked the full path: monolith, shared kernel, separate SPA, import map embedding, production deployment. Each step in the [companion repository](https://github.com/Krippke/monolith-to-micro-frontends) is a single commit you can check out and run.

The core takeaway: micro frontends are an organizational tool first and a technical tool second. The architecture should follow the team structure, not the other way around. If your teams have distinct domains, independent release cadences, and the operational maturity to manage distributed infrastructure, micro frontends unlock real velocity. If not, a clean monolith is not a compromise -- it is the right answer.

Clone the repo. Run `docker compose up -d`. Poke around. And before you reach for the micro frontend hammer, make sure you are actually looking at a nail.
