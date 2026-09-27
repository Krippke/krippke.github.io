---
layout: single
title: "One responsibility per component"
excerpt: "A component that serves several departments has several reasons to change - and every change for one of them can break the others. How to recognize when to split, and when splitting goes too far."
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/domino.jpg
tags:
  [
    single-responsibility-principle,
    software-architecture,
    refactoring,
    legacy-code,
    maintainability,
  ]
---

This post is part of the series [The hidden cost of unmaintainable code](TODO-link). A new developer has to implement a small change in an online shop: "Orders placed in December can be returned until January 31." This part is about their first attempt, and what it broke.

The developer has found the method that decides whether a return is still allowed. The change looks straightforward:

```python
def _within_deadline(self, order):
    if order.ordered_at.month == 12:
        return datetime.now() <= datetime(order.ordered_at.year + 1, 1, 31, 23, 59)
    return order.delivered_at + timedelta(days=14) >= datetime.now()
```

The return tests pass. The change is reviewed, merged and deployed.

The next morning, someone from accounting asks why no payment reminders went out for December orders. Customers who bought on invoice in December and never paid will not get a reminder before February.

## The shared helper

The developer searches for `_within_deadline` and finds a second caller, in the same class:

```python
def send_payment_reminders(self):
    rows = self.db.execute(
        "SELECT * FROM orders WHERE payment_method = 'invoice' AND paid_at IS NULL AND status = 4"
    ).fetchall()
    for row in rows:
        order = Order.from_row(row)
        if not self._within_deadline(order):
            self.mailer.send(order.customer_email, "Payment reminder", render_reminder(order))
```

Customers who buy on invoice have to pay within 14 days of delivery. Somebody noticed that `_within_deadline` already calculated "14 days after delivery" and reused it. It worked for years. Until the return period changed and took the payment term with it.

Two business rules. One decided by customer service, one by accounting. They shared an implementation because they happened to have the same number, and because they happened to live in the same class.

## Too many masters

The shared helper is only the symptom. The real problem is the class it lives in. `OrderService` does all of this:

- `calculate_total` - prices and discounts, changed whenever marketing runs a campaign
- `request_return` - the return process, owned by customer service
- `create_invoice` and `send_payment_reminders` - invoicing and dunning, owned by accounting
- `send_confirmation` - the order confirmation email, worded by marketing

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

The refactoring follows the actors. Each department's rules get their own home, and the payment term becomes a concept of its own, [explicit](TODO-link) and independent from the return period:

```python
@dataclass(frozen=True)
class PaymentTerm:
    due_on: date

    def is_overdue_on(self, day: date) -> bool:
        return day > self.due_on


class InvoicePaymentTerms:
    PAYMENT_DAYS = 14

    def payment_term_for(self, order: Order) -> PaymentTerm:
        return PaymentTerm(due_on=order.delivered_on + timedelta(days=self.PAYMENT_DAYS))
```

Sending reminders becomes a use case that only knows what it needs:

```python
class SendPaymentReminders:
    def __init__(
        self,
        orders: OrderRepository,
        payment_terms: InvoicePaymentTerms,
        clock: Clock,
        notifications: CustomerNotifications,
    ):
        self.orders = orders
        self.payment_terms = payment_terms
        self.clock = clock
        self.notifications = notifications

    def execute(self):
        today = self.clock.today()
        for order in self.orders.unpaid_invoice_orders():
            if self.payment_terms.payment_term_for(order).is_overdue_on(today):
                self.notifications.payment_overdue(order)
```

The return process gets the same treatment with `ReturnPeriod`, the return policies and a `RequestReturn` use case. Price calculation and the confirmation email move out as well. What is left of `OrderService` at the end is nothing. It gets deleted.

Now the two rules can change independently. And there is a test that makes sure they stay that way:

```python
def test_december_orders_are_reminded_14_days_after_delivery():
    order = an_order(ordered_on=date(2026, 12, 10), delivered_on=date(2026, 12, 12))

    term = InvoicePaymentTerms().payment_term_for(order)

    assert term.due_on == date(2026, 12, 26)
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

**Splitting a large class without breaking it.** I never do it in one step. I extract one responsibility at a time, let the old class delegate to the new one, and move the callers over when the tests are green. The [characterization tests](TODO-link) from the first step make this possible.

**Shared data.** The methods are easy to split. The data is harder. Every department uses the `Order`, and it tends to grow into a class that knows everything about everyone. Sometimes the right answer is to accept that accounting and customer service mean slightly different things when they say "order" - and give each its own model. That is a topic for another post.

**Knowing the actors.** You can only split along the actors if you know who they are. That is not something you can read from the code. It comes from talking to the people who use the system.

## A single master

When a component answers to one actor, a change for that actor stays where it belongs. The developer who implements the next return rule does not have to know how invoicing works. They do not have to be afraid of breaking payment reminders. The structure of the code makes it impossible.

That is the goal: components so focused that a change for one part of the business cannot surprise another.
