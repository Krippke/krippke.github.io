---
layout: single

title: "Migrating from Monolith to Micro Frontends: A Step-by-Step Guide - Part 1"
date: 2026-02-08 12:00:00 +0100
author: "Manuel Holzrichter"
tags:
  [
    micro frontends,
    frontend architecture,
    monolith migration,
    independent deployment,
    micro frontend tutorial,
    conways law,
  ]
---

Picture this. You are on a team building an internal company portal. Four features: news, time tracking, an employee directory, and a dashboard that pulls data from all three. Three teams own different parts. One repository. Every pull request is a minefield. You want to ship a CSS fix for the news page, but the time tracking team just pushed a half-finished feature and the build is red. Your deployment pipeline takes fifteen minutes and everyone waits in line. Ship day feels like a hostage negotiation.

Now imagine each team could build, test, and deploy their piece of the portal independently. No coordination. No waiting. No shared build queue. That is the promise of micro frontends.

This is part one of a two-part series. In this post, we build the monolith and take the first extraction step: splitting a module into its own standalone application. In part two, we go deeper with runtime composition using browser-native import maps, production deployment with Docker, and an honest look at when this approach is not worth the complexity.

Everything in this series is backed by a [companion repository](https://github.com/Krippke/monolith-to-micro-frontends) where each commit represents one architectural step. Clone it, check out the commits, and follow along.

## What Are Micro Frontends, Anyway?

The term "micro frontends" first appeared in the [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar/techniques/micro-frontends) in November 2016. Three years later, Martin Fowler's team published the [foundational article](https://martinfowler.com/articles/micro-frontends.html) that gave the concept its canonical definition. The core idea is simple: extend microservice principles to the frontend. Instead of one monolithic frontend application, you build independently developed, tested, and deployed UI modules that compose into a single user-facing product.

Think of it like a newspaper. The sports section, the business section, and the opinion page are written by separate editorial teams. They follow shared style guidelines -- same fonts, same column widths, same masthead. But each section ships on its own schedule. The reader sees one newspaper.

There are several ways to compose micro frontends: server-side includes, build-time integration via npm packages, iframes, JavaScript runtime integration, or Web Components. Each has trade-offs. In this series, we focus on two: **separate SPAs with nginx routing** (the simplest approach) and **runtime embedding via import maps** (the most seamless).

Before diving into the how, a word about the why. Conway's Law states that organizations design systems that mirror their communication structures. Micro frontends are no exception. If your organization has three teams with distinct domain responsibilities, micro frontends let each team own their slice end to end. If your organization is a single team, micro frontends might be a solution searching for a problem. McKinsey's research reinforces this: the operating model -- how teams are structured, how governance is applied -- matters as much as the technology choice. Architecture follows people, not the other way around.

## Building the Monolith First

Every good refactoring starts with a working system. The [first](https://github.com/Krippke/monolith-to-micro-frontends/commit/88e84e6) and [second](https://github.com/Krippke/monolith-to-micro-frontends/commit/622d68e) commits in the companion repository set up the Acme Portal as a classic monolith: a single Vue 3 + Quasar + Vite application with four page components, one Vue Router config, and local data files simulating a backend API.

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

This is a deliberate monolith, not an accidental one. All four modules live under one roof because we are starting here on purpose. But imagine what happens when three teams start contributing: merge conflicts multiply, coupled deploy cycles mean one team's bug blocks everyone, and the build grows slower with every feature.

Those are the pain points that micro frontends address. Not every project reaches this threshold. But when you do, the monolith starts to feel less like a foundation and more like a bottleneck.

## Step One: Extract a Shared Kernel

Before splitting anything, we need to identify what is truly shared across all modules. In the Acme Portal, that is the employee data model, the current user context, date formatting utilities, and the base stylesheet.

The [third commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/5bdedd2) moves these into `@acme/common`, a Yarn workspace package. The monorepo now has a root `package.json` defining workspaces for `common/`, `orchestrator/`, and the remotes that come later. Every micro frontend depends on this package at build time.

The barrel export in `common/src/index.js` defines the public API surface: employees, currentUser, formatDate, and navigation links. Anything that is domain-specific -- news articles, time entries -- stays in its respective module.

A key design decision here: the shared kernel is a **build-time dependency**, not a runtime service. Each micro frontend bundles its own copy. This avoids runtime coupling at the cost of some duplication. In a production system, you would version this package with semver and manage breaking changes through your normal release process.

## The Separate-SPA Approach: Extracting News

The simplest micro frontend pattern is to give each team their own single-page application. The [fourth commit](https://github.com/Krippke/monolith-to-micro-frontends/commit/09b3ebf) does exactly that: the News module becomes `remote-news/`, a standalone Vue + Vite app with its own `App.vue`, router, pages, and data.

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

Navigation between the orchestrator and the news SPA uses plain `<a href>` links. Clicking "News" triggers a full page reload. The news app renders its own layout, its own sidebar navigation, its own everything. The only integration point is the URL.

To make this work, the orchestrator introduces a smart `NavigationLink` component. It checks whether a route belongs to the current app or an external one. Local routes get a `<router-link>` for instant SPA navigation. External routes get an `<a href>` for a full page reload. The navigation config in `@acme/common` drives this with an `app` field on each link.

**The trade-offs are real.** On the pro side: complete independence. Each SPA can use a different framework if needed. Deploys are fully decoupled. A crash in News does not affect the rest of the portal. On the con side: full page reloads on every cross-app navigation. No shared application state at runtime. Each SPA renders the entire layout independently, so the sidebar flickers on every transition. The user experience feels stitched together rather than seamless.

One more thing worth calling out: `news.js` now exists in both the orchestrator (for the dashboard summary widgets) and in remote-news (for the full news pages). The dashboard needs summary data but cannot import from a remote at runtime. In a real system, both would call a shared API. In this demo, the duplication is intentional -- and it is a design constraint you will encounter in practice.

## What We've Got So Far -- and What's Missing

Let's recap. We started with a monolith, extracted shared code into a common package, and split the News module into its own independently deployed SPA. The separate-SPA approach solves the deploy-independence problem. Each team can ship on their own schedule. But it creates a user experience gap. Every cross-app navigation is a full page reload. There is no shared runtime state. The shell and the remote feel like two different websites wearing the same CSS.

What if we could embed a micro frontend directly inside the orchestrator's shell? Load it dynamically. Mount it into a DOM container. Unmount it when the user navigates away. All without iframes, without build-time bundling, using only features that ship natively in every modern browser.

That is exactly what we build in part two: import maps, runtime composition, Docker deployment, and the honest conversation about when you should not use micro frontends at all.
