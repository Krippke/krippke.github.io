---
layout: single
title: "The hidden cost of unmaintainable code"
excerpt: "Unmaintainable code does not fail loudly. It makes every change slower, riskier and more frightening. What it really costs, and how to turn legacy code back into simple, boring code."
date: 2026-09-30 18:00:00 +0200
last_modified_at: 2026-09-30T18:00:00+02:00
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/hidden-cost.jpg
tags:
  [
    software-architecture,
    legacy-code,
    refactoring,
    maintainability,
    clean-code,
  ]
---

Monday morning. A developer who joined the team three weeks ago picks up a ticket from the backlog: "Orders placed in December can be returned until January 31." The product owner estimated it at one hour. It is a small change. A date, a condition, done before lunch.

Three days later, the change is still not deployed. The developer has found four places in the codebase that deal with the return period. They do not agree with each other. Nobody on the team can say which one is correct. And the first attempt at the change broke the payment reminders for every December order.

Nothing in this story is unusual. I have seen it in almost every legacy system I have taken over. The change itself was trivial. The code around it was not.

## The costs nobody puts on the invoice

Unmaintainable code rarely fails loudly. It does not crash on day one. It just makes every change a little slower, a little riskier and a little more frightening than the one before. The cost is real, but it never shows up as a line item. It shows up as fear.

**Fear of deploying to production.** Every release is followed by the question: what did we break this time? Teams react by releasing less often, bundling more changes into each release and adding manual test phases. Which makes every release even riskier.

**Fear of dependency upgrades.** Upgrading a framework or a library means touching code nobody fully understands. So the upgrade gets postponed. And postponed again. Security patches pile up, and at some point the upgrade is no longer a task but a project.

**Fear of production incidents.** When something goes wrong, nobody knows where to look. The cause could be anywhere. I have seen bugs where finding the cause took weeks, and fixing it took ten minutes.

Behind these fears are costs that are harder to see:

- **Estimates become unreliable.** When nobody knows what a change will touch, every estimate is a guess. Trust between development and business erodes, and the answer is usually more control, more meetings and more buffer.
- **Knowledge concentrates in a few heads.** Only one or two people understand certain parts of the system. They become the bottleneck, and the risk, when they are sick or leave.
- **Onboarding takes months instead of weeks.** A new developer cannot learn a system that does not explain itself. They have to learn it from people.
- **Good developers leave.** Working in a codebase where every change is a fight is exhausting. The people who have offers use them.
- **The costs compound.** Every shortcut makes the next change more expensive. At some point, the interest is so high that there is no capacity left to pay the debt.

None of this is visible in a sprint report. All of it is visible in how a team feels about its own code.

## Where I start

I have taken over many legacy systems over the years and turned them into codebases that teams enjoy working in again. The process is always the same, and it does not start with code.

The first step is understanding. What problem does this system solve? What value is it supposed to create? How does it reach that goal, with which concepts? Which actors move through the system, and what is each one responsible for?

If these systems had tests, this would often be an easy task. Tests describe how the system should behave. But in every legacy system I have worked on, you could hardly speak of test coverage. So the second step is to turn the existing behaviour into tests, with as few changes to the code as possible.

That is where the first refactorings happen. A component with many dependencies requires an enormous test setup. So I constantly weigh two things against each other: how much do I change the structure of the code, and how complex do I allow my test setup to become? I rarely compromise here. Compromises take their revenge sooner than you think. In practice, this means introducing a clear domain without technical details, an application layer that orchestrates the domain's actors, a persistence layer whose only job is to store and restore state, and a humble UI, cleanly separated from the rest.

While I work towards test coverage, I build up my understanding of the codebase. I learn its concepts. I find implicit concepts and write them down to make them explicit later. I find decisions that are made in several places. Everything that does not quite fit the picture, but somehow still works, goes on the list. These notes are often indicators of a structural problem. Or put differently: of a concept that was implemented in an extremely complicated way.

Then I refactor, one note at a time. The goal is simple, boring code that does what it should.

## The developer is the client of the code

There is one idea behind all of this. We usually think of users as the clients of our software. But the code itself has a client too: the developer who has to change it next.

Everything a developer has to keep in their head while making a change is cognitive load. Implicit rules, places that have to change together, side effects in unrelated features, the question of where to even look. The more of that load the code puts on the developer, the slower and riskier every change becomes. Not because the developer is bad, but because human working memory is limited.

Maintainable code takes that load away. It explains itself, it has one place for every decision, and it has tests that tell you immediately when you broke something. Making the developer's job easy is not a luxury. It is where efficiency comes from.

Let us go back to the developer and the December ticket, and walk through what they ran into.

## Step 1: Pin down the behaviour first

The developer does not start by changing code. They start by writing a test for the current behaviour: an order delivered on March 1 can be returned on March 15, but not on March 16.

Even that is harder than expected. The return logic lives in an `OrderService` that talks directly to the database, the mail server and a PDF renderer, and reads the current time with `LocalDateTime.now()`. Testing one rule means setting up half the system. So the first small refactorings happen before any feature work: the clock is passed in instead of read, the rule is extracted from the database call.

The first test may even encode the wrong behaviour. That is fine. Any definition is better than no definition. It will be corrected in conversations with the people who know the business. What matters is that the behaviour is written down as an automated test. Without tests, you have to walk slowly and carefully. With tests, you can run, because you get told the moment you break something.

Deep dive: {% include series-link.html slug="refactoring-legacy-code-without-fear" text="Refactoring legacy code without fear" %}

## Step 2: The concept that does not exist

The developer searches the codebase for "return period". Nothing. The concept the business talks about every day does not exist in the code. What exists is this:

```kotlin
private fun withinDeadline(order: Order) =
    order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
```

Somebody had to know that "deadline" means return period here, and that `14` is a business decision, not a technical constant. That knowledge lived in the head of the original author. It is gone.

When a concept is implicit, every developer has to reconstruct it from arithmetic. When it is explicit - a `ReturnPeriod` with a name, a place and a clear rule - the code can be read in the language of the business, and the December rule has an obvious place to live.

Deep dive: {% include series-link.html slug="making-implicit-concepts-explicit" text="Making implicit concepts explicit" %}

## Step 3: Four places, three answers

While writing tests, the developer finds the return period in four places:

1. The backend counts 14 days from delivery, in server time.
2. The frontend counts 14 days from the order date.
3. A SQL report for customer service counts two weeks from delivery, in UTC.
4. The order confirmation email says "within 14 days", hard-coded.

None of these was wrong when it was written. Each was a reasonable interpretation of a rule that was never written down in one place. But they drifted apart, and the customer sees "returnable" in the shop while the backend rejects the return.

This is what implicit concepts lead to. The same decision gets made in several places, and several copies of a decision will drift. It is not a question of if, but when. The December change did not create this bug. It only made it visible.

The fix is not to update four places. It is to make the decision once, and let everything else ask for the result.

Deep dive: {% include series-link.html slug="one-decision-one-place" text="One decision, one place" %}

## Step 4: The change that broke the invoices

The developer's first attempt was the obvious one: add the December rule to `withinDeadline`. The return tests passed. The next morning, accounting reported that no payment reminders had been sent for December orders.

The same `OrderService` also sends payment reminders for customers who buy on invoice. Their payment term happens to be 14 days after delivery as well, so somebody reused `withinDeadline` for it. Two unrelated business rules, owned by two different departments, shared one implementation because they happened to have the same number.

A component that serves customer service, accounting and marketing at the same time has three reasons to change. Every change for one of them risks breaking the others.

Deep dive: {% include series-link.html slug="one-responsibility-per-component" text="One responsibility per component" %}

## Step 5: The rule in the wrong place

Finally, the developer finds that the return rule is also baked into a SQL query, and that the domain logic depends on the system clock. The date formatting for the shop is computed in the backend. The database query knows business rules. The business rule knows about the clock.

When responsibilities sit on the wrong layer, changes spread across layers that should not care. The UI should only decide how things look. Persistence should only store and restore state. The domain should know the business rules and nothing about technology. And the application layer should orchestrate the domain and keep external dependencies behind ports.

Deep dive: {% include series-link.html slug="responsibilities-in-the-right-layer" text="Responsibilities in the right layer" %}

## The same change, one more time

After the refactoring, the return period is a concept in the domain. It is computed in one place. The frontend, the email and the report all get it from there. Payment terms are their own concept. The clock is passed in.

Now the December ticket looks like this:

```kotlin
class HolidayReturnPolicy(private val standardPolicy: ReturnPolicy) : ReturnPolicy {
    override fun returnPeriodFor(orderedOn: LocalDate, deliveredOn: LocalDate): ReturnPeriod {
        val standardPeriod = standardPolicy.returnPeriodFor(orderedOn, deliveredOn)
        if (orderedOn.month != Month.DECEMBER) return standardPeriod
        return standardPeriod.extendedTo(LocalDate.of(orderedOn.year + 1, 1, 31))
    }
}
```

```kotlin
@Test
fun `december orders can be returned until january 31`() {
    val policy = HolidayReturnPolicy(StandardReturnPolicy())

    val period = policy.returnPeriodFor(
        orderedOn = LocalDate.of(2026, 12, 10),
        deliveredOn = LocalDate.of(2026, 12, 12),
    )

    assertEquals(LocalDate.of(2027, 1, 31), period.endsOn)
}
```

One new class, one new test, one line of wiring. The same developer implements it in less than the hour the product owner estimated. Not because they know the system better now, but because they do not have to.

## Why I enjoy this work

I will be honest: making software maintainable is one of the most satisfying parts of my job. Finding an implicit concept, thinking about how to express it in the structure of the code, and watching complicated code turn into something simple, beautiful and stable - that never gets old.

And there is a particular kind of calm that comes from merging a duplicated decision into one place. I know that the next developer who changes it will not produce a bug there. Not because they are careful, but because the code does not leave room for it.

That is what maintainability means to me. It is not a concern for purists. It is what allows software to keep changing, and what allows the people working on it to enjoy their work again. No more fear of deploying on a Friday. No more postponed upgrades. No more incidents that take weeks to trace.

The goal is simple, boring code that does what it should.

## The series

This post is the overview of a series. Each deep dive takes one step from the story and walks through a concrete refactoring:

1. {% include series-link.html slug="refactoring-legacy-code-without-fear" text="Refactoring legacy code without fear" pending=" - coming soon" %}
2. {% include series-link.html slug="making-implicit-concepts-explicit" text="Making implicit concepts explicit" pending=" - coming soon" %}
3. {% include series-link.html slug="one-decision-one-place" text="One decision, one place" pending=" - coming soon" %}
4. {% include series-link.html slug="one-responsibility-per-component" text="One responsibility per component" pending=" - coming soon" %}
5. {% include series-link.html slug="responsibilities-in-the-right-layer" text="Responsibilities in the right layer" pending=" - coming soon" %}
