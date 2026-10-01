---
title: "One responsibility per component"
excerpt: "A component that serves several departments has several reasons to change - and every change for one of them can break the others. How to recognize when to split, and when splitting goes too far."
date: 2026-10-28 06:00:00 +0100
updated: 2026-10-28T06:00:00+01:00
teaser: /assets/images/one-responsibility.jpg
tags: [single-responsibility-principle, software-architecture, refactoring, legacy-code, maintainability]
---

This post is part of the series :series-link[The hidden cost of unmaintainable code]{slug="the-hidden-cost-of-unmaintainable-code"}. A new developer has to implement a small change in an online shop: "Orders placed in December can be returned until January 31." This part is about their first attempt, and what it broke.

The developer has found the method that decides whether a return is still allowed. The change looks straightforward:

```kotlin
private fun withinDeadline(order: Order): Boolean {
    if (order.orderedAt.monthValue == 12) {
        return LocalDateTime.now() <= LocalDateTime.of(order.orderedAt.year + 1, 1, 31, 23, 59)
    }
    return order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
}
```

The return tests pass. The change is reviewed, merged and deployed.

The next morning, someone from accounting asks why no payment reminders went out for December orders. Customers who bought on invoice in December and never paid will not get a reminder before February.

## The shared helper

The developer searches for `withinDeadline` and finds a second caller, in the same class:

```kotlin
fun sendPaymentReminders() {
    val orders = jdbc.query(
        "SELECT * FROM orders WHERE payment_method = 'invoice' AND paid_at IS NULL AND status = 4",
        OrderRowMapper(),
    )
    for (order in orders) {
        if (!withinDeadline(order)) {
            mailer.send(order.customerEmail, "Payment reminder", renderReminder(order))
        }
    }
}
```

Customers who buy on invoice have to pay within 14 days of delivery. Somebody noticed that `withinDeadline` already calculated "14 days after delivery" and reused it. It worked for years. Until the return period changed and took the payment term with it.

Two business rules. One decided by customer service, one by accounting. They shared an implementation because they happened to have the same number, and because they happened to live in the same class.

## Too many masters

The shared helper is only the symptom. The real problem is the class it lives in. `OrderService` does all of this:

- `calculateTotal` - prices and discounts, changed whenever marketing runs a campaign
- `requestReturn` - the return process, owned by customer service
- `createInvoice` and `sendPaymentReminders` - invoicing and dunning, owned by accounting
- `sendConfirmation` - the order confirmation email, worded by marketing

Four responsibilities, three departments, one class. Every one of them can ask for a change at any time, for their own reasons. And inside one class, sharing is easy and invisible. A private helper here, a shared variable there. Nobody decided to couple the return period to the payment term. It just happened, because it was convenient.

Robert C. Martin describes the Single Responsibility Principle in *Clean Architecture* like this: "A module should be responsible to one, and only one, actor." I find this far more useful than "a class should do one thing", because "one thing" can mean anything. The question "who will ask me to change this?" has a concrete answer.

For `OrderService`, the answer is: marketing, customer service and accounting. That is three reasons to change, and every change for one of them risks breaking something for the others. Exactly what happened with the December rule.

## What it costs

A component with several responsibilities is expensive in ways that are easy to miss:

- **Changes have side effects in unrelated features.** The December bug is the obvious example. The less obvious ones are the bugs nobody has noticed yet.
- **Understanding one feature requires understanding all of them.** To change the return process safely, the developer has to read the invoicing code too. That is cognitive load that has nothing to do with their task.
- **Tests need huge setups.** Testing one method of a class with four responsibilities means satisfying the dependencies of all four.
- **Teams get in each other's way.** Two features for two departments touch the same file. Merge conflicts, coordinated releases, waiting.

## Splitting along the actors

The refactoring follows the actors. Each department's rules get their own home, and the payment term becomes a concept of its own, :series-link[explicit]{slug="making-implicit-concepts-explicit"} and independent from the return period:

```kotlin
data class PaymentTerm(val dueOn: LocalDate) {
    fun isOverdueOn(day: LocalDate): Boolean = day > dueOn
}

class InvoicePaymentTerms {
    fun paymentTermFor(deliveredOn: LocalDate): PaymentTerm =
        PaymentTerm(dueOn = deliveredOn.plusDays(PAYMENT_DAYS))

    companion object {
        const val PAYMENT_DAYS = 14L
    }
}
```

Sending reminders becomes a use case that only knows what it needs:

```kotlin
data class UnpaidInvoice(val orderId: Long, val customerEmail: String, val deliveredOn: LocalDate)

class SendPaymentReminders(
    private val orders: OrderRepository,
    private val paymentTerms: InvoicePaymentTerms,
    private val clock: Clock,
    private val notifications: CustomerNotifications,
) {
    fun execute() {
        val today = clock.today()
        for (invoice in orders.unpaidInvoices()) {
            if (paymentTerms.paymentTermFor(invoice.deliveredOn).isOverdueOn(today)) {
                notifications.paymentOverdue(invoice)
            }
        }
    }
}
```

The return process gets the same treatment with `ReturnPeriod`, the return policies and a `RequestReturn` use case. Price calculation and the confirmation email move out as well. What is left of `OrderService` at the end is nothing. It gets deleted.

Now the two rules can change independently. And there is a test that makes sure they stay that way:

```kotlin
@Test
fun `december orders are reminded 14 days after delivery`() {
    val term = InvoicePaymentTerms().paymentTermFor(deliveredOn = LocalDate.of(2026, 12, 12))

    assertEquals(LocalDate.of(2026, 12, 26), term.dueOn)
}
```

This test would have caught the bug before it reached production. And it documents something that was never written down before: the December return rule has nothing to do with when customers have to pay.

## How to recognize a component with too many responsibilities

Some questions I ask when I work through a legacy codebase:

- **Who asks for changes to this component?** If the answer is more than one department, role or team, it is a candidate for splitting.
- **Can I describe what it does without "and"?** "It calculates prices and handles returns and creates invoices" is three components.
- **Do private helpers serve unrelated public methods?** That is where accidental coupling hides.
- **Does testing one behaviour require setting up dependencies for another?** The test setup often tells you more about the structure than the code.
- **Do unrelated features keep colliding in the same file?** Merge conflicts are a structural signal.

## When splitting goes too far

There is a counterweight to all of this, and it is important. Splitting can go too far.

I have seen codebases where every class has exactly one method: a `ReturnPeriodCalculator`, a `ReturnPeriodValidator`, a `ReturnPeriodFormatter`, a `ReturnPeriodCalculatorFactory`. Each one is trivial. Understanding how they work together is not. The cognitive load did not go away. It moved from the classes into the wiring between them.

John Ousterhout describes this in *A Philosophy of Software Design* as the difference between shallow and deep modules. A deep module hides a lot of complexity behind a simple interface. A shallow module has an interface that is almost as complex as what it does. Lots of shallow modules make a system harder to understand, not easier.

That is why I split along actors and reasons to change, not along verbs or lines of code. `ReturnPeriod` knows when it ends and whether a return is allowed on a given day. Both belong together, because they change together, for the same people. Splitting them apart would add a class and remove nothing.

## Where it gets hard

**Splitting a large class without breaking it.** I never do it in one step. I extract one responsibility at a time, let the old class delegate to the new one, and move the callers over when the tests are green. The :series-link[characterization tests]{slug="refactoring-legacy-code-without-fear"} from the first step make this possible.

**Shared data.** The methods are easy to split. The data is harder. Every department uses the `Order`, and it tends to grow into a class that knows everything about everyone. Sometimes the right answer is to accept that accounting and customer service mean slightly different things when they say "order" - and give each its own model. That is a topic for another post.

**Knowing the actors.** You can only split along the actors if you know who they are. That is not something you can read from the code. It comes from talking to the people who use the system.

## A single master

When a component answers to one actor, a change for that actor stays where it belongs. The developer who implements the next return rule does not have to know how invoicing works. They do not have to be afraid of breaking payment reminders. The structure of the code makes it impossible.

That is the goal: components so focused that a change for one part of the business cannot surprise another.
