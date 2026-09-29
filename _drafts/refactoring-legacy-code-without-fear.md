---
layout: single
title: "Refactoring legacy code without fear"
excerpt: "Without tests you have to walk slowly and carefully. With tests you can run. How to get a safety net into a legacy system that has none - and why the first tests are allowed to be wrong."
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/keys-not-just-for-coding.jpg
tags:
  [legacy-code, refactoring, testing, characterization-tests, maintainability]
---

This post is part of the series [The hidden cost of unmaintainable code](TODO-link). The series follows a new developer through a small change in an online shop: "Orders placed in December can be returned until January 31." This part is about the first thing they do, before touching any feature code.

The developer opens `OrderService`. It is 1,400 lines long. It calculates totals, handles returns, creates invoices, sends payment reminders and confirmation emails. There is a `tests` folder. It contains one file, last changed four years ago, and it is skipped.

The ticket says one hour. The developer's gut says: if I change something here, I have no idea what else I break.

That gut feeling is right. And it is the most expensive feeling in software development.

## Walking in the dark

Without tests, every change to a legacy system is a walk in the dark. You move slowly. You read every line twice. You click through the application by hand after each change and hope you tested the right things. You deploy and watch the logs.

And still, things break. Not because the developer is careless, but because nobody can keep the whole system in their head. The side effects are there, they are just not visible.

The cost is not only the bugs. It is the slowness. Every change takes longer than it should, because every change has to be made with maximum caution. Multiply that by every developer and every change for years, and you get one of the biggest hidden costs of legacy code.

Tests change that. I think of it like this: without tests, you have to walk slowly and carefully. With tests, you can run - because you are told the moment you break something.

## Tests are the definition of behaviour

I have written about this before in [The role of tests](https://www.manuel-holzrichter.de/2024/01/11/the-role-of-tests/): for me, tests are not a verification step at the end. They are the definition of what the system is supposed to do.

In a legacy system, that definition does not exist. The behaviour exists, somewhere in 1,400 lines, but nobody wrote down what it is supposed to be. So the first goal is not to improve anything. The first goal is to turn the existing behaviour into tests, with as few changes to the code as possible.

Michael Feathers calls these _characterization tests_ in _Working Effectively with Legacy Code_. You do not write down what the code should do. You write down what it actually does.

## Any definition is better than no definition

Here is the part that surprises people: the first tests are allowed to be wrong.

When I take over a legacy system, I do not know the business yet. I write tests based on what the code does and what I think it means. Some of those definitions will be wrong. That is fine. They will be corrected in conversations with domain experts and stakeholders over the next iterations.

What matters is that the behaviour is written down as an automated test. A wrong definition that is written down can be discussed and corrected. A correct definition that only exists in someone's head cannot be checked by anyone.

## The first obstacle: you cannot test it

Here is the return logic the developer finds:

```kotlin
@Service
class OrderService(
    private val jdbc: JdbcTemplate,
    private val mailer: Mailer,
    private val pdfRenderer: PdfRenderer,
) {
    fun requestReturn(orderId: Long) {
        val order = jdbc.queryForObject("SELECT * FROM orders WHERE id = ?", OrderRowMapper(), orderId)
        if (order.status != 4) throw IllegalStateException("Order not delivered")
        if (!withinDeadline(order)) throw IllegalStateException("Too late")
        jdbc.update("UPDATE orders SET status = 7 WHERE id = ?", orderId)
        mailer.send(order.customerEmail, "Your return", renderReturnLabel(order))
    }

    private fun withinDeadline(order: Order) =
        order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
}
```

To write a single test for "an order can be returned on day 14", the developer needs a database with an order row, a mailer that does not send real emails, a PDF renderer and control over the current time.

This is the moment where I constantly weigh two things against each other: how much do I change the structure of the code, and how complex do I allow my test setup to become?

The tempting path is to leave the code as it is and build the setup: a test database, a mocked mailer, a static mock that freezes `LocalDateTime.now()`. It works. But the tests are now tied to every detail of the current structure. Every refactoring later breaks them. And the setup hides the actual problem: this code has too many dependencies.

I rarely compromise here. Compromises take their revenge sooner than you think.

## Small, safe steps first

Refactoring without tests is risky. So the first refactorings have to be small, mechanical and ideally done by the IDE: extract a function, introduce a parameter, move a query behind a method. Changes where the behaviour cannot change by accident.

The first step is to pull the decision out of the service, into a function that only depends on its inputs:

```kotlin
fun withinReturnDeadline(order: Order, now: LocalDateTime): Boolean =
    order.deliveredAt!!.plusDays(14) >= now
```

The second step is to stop reading the clock inside the service. The service gets a `Clock` passed in, and production code uses a `SystemClock`:

```kotlin
@Service
class OrderService(
    private val jdbc: JdbcTemplate,
    private val mailer: Mailer,
    private val pdfRenderer: PdfRenderer,
    private val clock: Clock,
) {
    fun requestReturn(orderId: Long) {
        ...
        if (!withinReturnDeadline(order, clock.now())) throw IllegalStateException("Too late")
        ...
    }
}
```

Nothing about the behaviour has changed. But the rule can now be tested without a database, a mailer or a frozen system clock.

## Tests that tell you something

```kotlin
@Test
fun `order can be returned 14 days after delivery`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertTrue(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 15, 15, 59)))
}

@Test
fun `order cannot be returned 15 days after delivery`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertFalse(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 16, 9, 0)))
}

@Test
fun `return deadline ends at the exact delivery time on day 14`() {
    val order = anOrder(deliveredAt = LocalDateTime.of(2026, 3, 1, 16, 0))

    assertFalse(withinReturnDeadline(order, now = LocalDateTime.of(2026, 3, 15, 16, 1)))
}
```

The third test is the interesting one. While writing it, the developer realised that the deadline is precise to the minute: a customer whose parcel arrived at 4 PM can return it until 4 PM two weeks later, but not at 4:01 PM. Is that intended? Probably not. But it is what the system does today, so it becomes a test with an honest name.

That test is a question written as code. The developer takes it to customer service. The answer: of course the whole day counts. The test gets renamed and changed, the code follows. The definition was wrong, it got corrected, and now it is right and written down.

This is how characterization tests turn into specifications over time.

## Separate before you fake

For the orchestration in `request_return` - load the order, check the rule, update the status, send the email - the developer still needs to replace the database and the mailer in tests.

Faking raw SQL calls is painful and fragile. So instead of mocking the `JdbcTemplate`, I move the queries behind an `OrderRepository` with `get` and `save`, and the mail sending behind a `CustomerNotifications` port. Both have simple in-memory implementations for tests. The service stops knowing about SQL and SMTP altogether.

This is where test coverage and structure start to reinforce each other. The effort to make the code testable is the same effort that gives it a clear domain, an application layer that orchestrates, a persistence layer that only stores and restores state, and a humble UI. The details are in [Responsibilities in the right layer](TODO-link).

## The notes list

Writing characterization tests forces you to read every branch of the code closely. That is exactly how you understand a legacy system. And while doing it, I keep a list of everything that does not fit into my picture.

For the developer in the shop, the list looked like this after two days:

```
- "deadline" in withinDeadline means return period. The concept has no name.
- Return period is also computed in the frontend (from order date!) and in the customer service report (UTC).
- Confirmation email hard-codes "within 14 days".
- withinDeadline is also used for payment reminders. Same number, different rule?
- status == 4 means delivered, status == 7 means return requested. No enum.
- Return deadline precise to the minute. Confirmed: should be whole days.
```

Every line on this list is a symptom of a structural problem. Or put differently: of a concept that was implemented in an extremely complicated way. The list becomes the backlog for the actual refactoring, and each entry leads to one of the principles in this series:

- A concept without a name → [Making implicit concepts explicit](TODO-link)
- The same decision in several places → [One decision, one place](TODO-link)
- One function serving two departments → [One responsibility per component](TODO-link)
- Business rules in SQL and the frontend → [Responsibilities in the right layer](TODO-link)

## Where it gets hard

**You cannot always start small.** Some code is so entangled that even extracting a function feels dangerous. In that case, I start with a coarse safety net at the outermost boundary: record the responses of the existing system for a set of real inputs and compare against them after every change. This is known as _approval testing_ or _golden master testing_. It is not a specification, but it is a net, and it can be removed once the finer tests exist.

**Characterization tests encode bugs.** They pin down what the system does, including what it does wrong. That is intended. Name those tests honestly, mark them as questions and take them to the people who know. The bug is now visible instead of hidden.

**It feels slow at first.** The first days produce tests and small refactorings, but no features. That is the investment. The payback comes the first time a change that would have taken days takes an hour, and the tests tell you it is safe to deploy.

## Start running

Being wrong is part of the process. I wrote about that in [Why you always need to be wrong](https://www.manuel-holzrichter.de/2026/02/19/why-you-always-need-to-be-wrong/). The point is not to avoid mistakes, but to notice them immediately.

That is what a safety net gives you in a legacy system. Not certainty, but feedback. The first tests may be wrong. The first refactorings may be tiny. But from the moment the behaviour is written down, you can stop tiptoeing through the code.

You can start running.
