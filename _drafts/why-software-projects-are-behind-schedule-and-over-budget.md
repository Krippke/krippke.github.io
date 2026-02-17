---
layout: single

title: "Why your software project is behind schedule (and over budget)"
date: 2026-02-17 12:00:00 +0100
last_modified_at: 2026-02-17T12:00:00+01:00
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/placeholder.jpg
tags:
  [
    software development,
    project management,
    estimation,
    communication,
    feedback loops,
  ]
---

Wednesday afternoon, three weeks before the deadline. The project kicked off six months ago with a clean backlog and a team that genuinely believed they would ship on time. Now everyone in the status meeting avoids eye contact. Last week's demo uncovered a fundamental misunderstanding about a core feature. Half the sprint's work needs rework. The remaining estimate has quietly doubled. Nobody is surprised. But nobody saw it coming either.

I have been on both sides of that table. The developer wondering how we got here, and the lead trying to explain to a stakeholder why three months turned into six. After more than 15 years of building software, I am convinced the answer is almost never "we were lazy" or "we were bad at coding." The technical work rarely derails a project. What derails it are **long feedback loops**, **unvalidated trust**, and **estimation by gut feeling**.

The [Standish Group analyzed over 50,000 technology projects](https://opencommons.org/CHAOS_Report_on_IT_Project_Outcomes) and found that 66% end in partial or total failure. Only 31% are delivered on time, on budget, with the planned scope. Those odds are bad. But the causes are surprisingly fixable.

## The Real Cost of Long Feedback Loops

I wrote once that [software development is like walking in a fog](/2024/01/17/the-role-of-iterating/). You cannot see the end. You take small steps, reassess what you find, decide which direction to go next. Long feedback loops are what happens when you stop doing that. You walk confidently for hundreds of meters without checking your surroundings, and when the fog lifts, you realize you have been heading in the wrong direction the entire time.

A feedback loop is the time between making a decision and learning whether it was right. Every day without validation is a day you might be building the wrong thing. [IBM's research](https://www.functionize.com/blog/the-cost-of-finding-bugs-later-in-the-sdlc) put numbers on this: fixing a bug found during implementation costs roughly six times more than catching it during design. The further a mistake travels from where it was made, the more it costs to undo.

## Validate First, Then Build

Early in my career, I spent three weeks building an elaborate reporting module. Beautiful charts. Configurable date ranges. Export to PDF. The whole thing. When we presented it to the client, they stared at it for ten seconds and said, "This is nice, but we just needed a single number on a dashboard." Three weeks of work for something that could have been done in a day. The code was fine. We just built the wrong thing.

I see this pattern everywhere. Teams treat all backlog items as build tasks when many of them are actually validation tasks. The question is rarely "Can we build this?" It is almost always "Should we build this, and does our understanding match reality?" Build the smallest possible version and put it in front of a real user. Not a prototype approved by proxy. The actual smallest thing that tests your riskiest assumption.

[Studies show](https://digitaloctopusgroup.com/breaking-down-the-70-failure-rate-in-software-development/) that 70% of digital transformation failures trace back to requirements issues. Not because people were careless, but because nobody validated the requirements early enough.

Fixing a wrong assumption after months of building on top of it is like [replacing a house's foundation while you are already putting on the roof tiles](/2025/05/05/the-role-of-writing/). Not impossible. But nobody enjoys it.

## Misunderstandings

Here is one that cost a team I worked with two full sprints of rework. The stakeholder asked for "user groups." The developers heard "permission model" - roles, access control, hierarchies. What the stakeholder actually meant was a way to tag users for batch email notifications. Same words. Completely different features. Nobody noticed until the demo.

This is not a people problem. It is a process problem. When the gap between "we discussed this" and "we verified what we meant" stretches over weeks, small misunderstandings have time to become large implementation gaps.

The [Project Management Institute](https://www.pmi.org/learning/library/communication-method-content-in-project-9937) found that poor communication contributes to 56% of project failures. Projects with effective communication practices are twice as likely to deliver on scope. The difference is not talent. It is how often and how early you close the loop between assumption and confirmation.

So shorten the distance between discussion and demonstration. Write down what you understood. Sketch it. Build a throwaway prototype in an afternoon. Turn the abstract agreement into something concrete that both sides can look at and say "yes, that is what I meant" - or better, "no, not quite."

I have written about [the role of writing](/2025/05/05/the-role-of-writing/) in debugging your own thinking. The same applies here. If you cannot write down what you are building in plain language, you do not understand it yet.

## Your Test Suite Is a Feedback Loop

The problems above involve other people. This one is entirely on us.

A missing or incomplete test suite is the feedback loop we control, and the one teams neglect most. Without automated tests, the only way to know if your change broke something is to manually click through the application. That takes time. So you skip it for "small changes." Then one small change breaks something three screens away, and you find out at the next demo. Or in production.

Tests are not just quality gates. They are feedback loops on fast forward. A solid test suite tells you within seconds whether your latest change is compatible with every assumption the system was built on. Seconds, not weeks.

[Research shows](https://codesuite.org/blogs/identifying-bugs-early-the-way-to-cutting-software-costs-by-50/) that early and continuous testing saves roughly 40% of total development time. Writing tests is not free, but the cost of finding problems late is nothing compared to the investment.

Back to the fog metaphor: your test suite is the ground beneath your feet. You might not see far ahead, but at least you know the step you just took was solid.

## Unvalidated Trust

When a stakeholder says "we need this," there is a natural tendency to trust the statement and start building. Trust feels like professionalism. Questioning feels like getting in the way. So the feature goes on the backlog, gets estimated, gets built, gets shipped. And nobody uses it.

Trust is fine. **Unvalidated** trust is the problem. Every statement about what users need is an assumption until it is backed by evidence. Customers describe solutions instead of problems. Colleagues relay information through their own interpretation. Nobody is lying. But both are filtering reality through their perspective. The developer who hears "the customer wants a notification system" might not know that the customer actually said "I sometimes miss important updates" - a problem you could solve in a dozen ways, most of them simpler than a notification system.

[The Standish Group found](https://www.mountaingoatsoftware.com/blog/are-64-of-features-really-rarely-or-never-used) that 64% of software features are rarely or never used. Only 20% deliver high value. Every one of those unused features was "needed" at some point. Someone said so, and the team trusted it.

[Confirmation bias](https://www.researchgate.net/publication/235430372_Confirmation_Bias_in_Software_Development_and_Testing_An_Analysis_of_the_Effects_of_Company_Size_Experience_and_Reasoning_Skills) makes this worse. Once a team accepts a claim as fact, they start seeking evidence that supports the decision and ignoring signals that contradict it. The feature grows in scope. Nobody re-asks "do we actually know this is what users need?" The original statement has hardened into certainty without ever being tested.

Treat every "we need" statement as a hypothesis. How do we know? Who said it? Can we observe the behavior? Can we test it with the smallest possible experiment before committing weeks of development time?

## Gut Feelings Instead of Estimation

Long feedback loops explain why projects drift off course. But estimation is where many projects are set up for failure before the first line of code is written.

You are in a planning meeting. The product owner describes a feature. Someone says "probably a week." Someone else says "more like three weeks." The team settles on two because it is in the middle and feels reasonable. Nobody has broken the work down. Nobody has identified the unknowns. The estimate is a social consensus, not an analysis.

Daniel Kahneman and Amos Tversky identified this in 1979 and called it the [Planning Fallacy](https://en.wikipedia.org/wiki/Planning_fallacy). When people estimate tasks, they instinctively simulate the best-case scenario. Everything goes smoothly. No sick days, no surprise dependencies, no requirements changing mid-sprint. They estimate based on how it _could_ go, not how it typically goes.

Initial project estimates can vary by a factor of four. Even the best estimation models in the research show a mean error of 39%. We are not bad at estimating because we are careless. We are bad at it because our brains are wired to be optimistic about our own plans.

So before you put a number on something, bring light into the dark spots. Which parts have you built before? Which parts are genuinely new? Where are the dependencies you do not control? The unknowns are where the risk lives, and risk is what turns a two-week estimate into a two-month reality.

[Standish Group data](https://opencommons.org/CHAOS_Report_on_IT_Project_Outcomes) backs this up: small projects succeed roughly 90% of the time. Large projects succeed less than 10%. The difference is not just complexity. Large projects have more unknowns, more assumptions, and more places where optimistic estimates compound on each other.

Kahneman proposed a remedy he called reference class forecasting. Instead of asking "how long will this take?", ask "how long did similar things take in the past?" Look at your team's actual delivery history, not their optimistic estimates. Not exciting. But it works.

## Small Steps, Eyes Open

Remember that Wednesday afternoon status meeting? Someone could have seen it coming - if the feedback loops had been shorter and the estimates had been grounded in evidence instead of hope.

Long feedback loops let small problems grow into large ones. Unvalidated trust turns opinions into weeks of wasted work. Gut-feel estimation makes the timeline fiction from day one. These patterns account for most of the schedule overruns I have seen in 15 years. And the answer is not a new methodology or a better tool. It is discipline. Validate before you build. Test continuously. Estimate based on what actually happened, not what you hope will happen.

Software development will always be a walk in the fog. But we can take smaller steps and check our footing more often. The projects that finish on time are not the ones with perfect plans. They are the ones that learned to course-correct before it was too late.
