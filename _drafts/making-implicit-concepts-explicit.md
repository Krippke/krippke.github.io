---
layout: single
title: "Making implicit concepts explicit"
excerpt: "The concept your business talks about every day often does not exist in your code. How to find implicit concepts, how to express them in the structure of the code, and why it turns complicated code into simple code."
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/celebrating.jpg
tags:
  [
    domain-driven-design,
    refactoring,
    legacy-code,
    maintainability,
    clean-code,
  ]
---

This post is part of the series [The hidden cost of unmaintainable code](TODO-link). A new developer has to implement a small change in an online shop: "Orders placed in December can be returned until January 31." They have already [put a safety net of tests in place](TODO-link). Now they want to find the return period in the code.

They search for "return period". Nothing. "Return deadline". Nothing. "Returnable". Nothing.

Customer service talks about the return period every day. It is in the terms and conditions, on the product pages, in every second support ticket. But in the code, it does not exist. What exists is this:

```python
def _within_deadline(self, order):
    return order.delivered_at + timedelta(days=14) >= datetime.now()
```

And a few lines above it:

```python
if order.status != 4:
    raise ValueError("Order not delivered")
```

The concept is there. It is just implicit - hidden in arithmetic, a magic number and a method name that could mean anything.

## What an implicit concept costs

An implicit concept is a piece of business knowledge that the code relies on but never names. The code works. But to understand it, a developer has to reconstruct the concept from the implementation every single time.

`delivered_at + timedelta(days=14) >= datetime.now()` tells you what is being calculated. It does not tell you why, what the 14 means, whether it will ever change or who decides that. The original author knew. That knowledge was never written into the code, and when the author left, it left with them.

This is cognitive load in its purest form. Every developer who touches this code has to hold the translation in their head: "deadline means return period, 4 means delivered, 14 is a business decision, not a technical constant". Miss one of those, and you produce a bug.

And it gets worse. Because the concept has no home, every developer who needs it builds their own version. The frontend computes its own return period. The report computes its own. That is how implicit concepts turn into [decisions spread across the system](TODO-link), and those decisions drift apart.

## How to find implicit concepts

Eric Evans dedicates a whole chapter of *Domain-Driven Design* to this topic, titled "Making Implicit Concepts Explicit". His advice starts with listening to the language of the domain experts and scrutinizing the places where the design feels awkward. Over the years, I have collected a list of signals that point me to implicit concepts in legacy code:

- **A word the business uses that the code does not know.** If customer service says "return period" and the code says `_within_deadline`, something is missing.
- **Magic numbers and strings.** `14`, `status == 4`, `type == "B2B"`. Every one of them is a decision somebody made.
- **Combinations of conditions.** `if order.is_gift and not order.is_business and order.country == "DE"` usually has a name in the business. The code just does not use it.
- **Comments that explain what the code means.** A comment like `# 4 = delivered` is a concept asking to be named.
- **The same condition in several places.** If you see the same calculation twice, there is a concept behind it.
- **Primitive types for business values.** Dates, amounts and identifiers passed around as `datetime`, `float` and `str`, with the rules that belong to them scattered across the callers.
- **Code that is strangely complicated for what it does.** Long methods with several phases, flags that switch behaviour, special cases stacked on special cases. Often, a missing concept is forcing the code to take detours.

When I work through a legacy system, all of these go on my notes list. In the shop, the list pointed to two missing concepts: the order status and the return period.

## From magic numbers to names

The simplest implicit concepts only need a name. The order status is one of them:

```python
class OrderStatus(Enum):
    PLACED = 1
    PAID = 2
    SHIPPED = 3
    DELIVERED = 4
    CANCELLED = 5
    REFUNDED = 6
    RETURN_REQUESTED = 7
```

```python
if not order.is_delivered():
    raise OrderNotDelivered(order.id)
```

This is a small change. But the next developer no longer needs to know that 4 means delivered. The code says it.

## From arithmetic to a concept

The return period needs more than a name. It has a rule, and it has behaviour: it ends on a certain day, and a return is allowed until then. So it becomes a value object:

```python
@dataclass(frozen=True)
class ReturnPeriod:
    ends_on: date

    def allows_return_on(self, day: date) -> bool:
        return day <= self.ends_on

    def extended_to(self, day: date) -> "ReturnPeriod":
        return ReturnPeriod(ends_on=max(self.ends_on, day))
```

How the return period is determined for an order is a business rule of its own. It gets its own place too:

```python
class StandardReturnPolicy:
    RETURN_DAYS = 14

    def return_period_for(self, order: Order) -> ReturnPeriod:
        return ReturnPeriod(ends_on=order.delivered_on + timedelta(days=self.RETURN_DAYS))
```

Notice the `date` instead of `datetime`. While writing the characterization tests, the developer found out that the old deadline was precise to the minute, and customer service confirmed that the whole day should count. Making the concept explicit is often the moment where such questions come up and get answered.

The code that uses it now reads like the business talks:

```python
period = self.return_policy.return_period_for(order)
if not period.allows_return_on(today):
    raise ReturnPeriodExpired(period)
```

## The December rule finds its place

Now back to the ticket. With the implicit version, there was only one place to put the December rule: another condition inside `_within_deadline`. With the explicit version, the December rule is not a special case of some arithmetic. It is a variation of the return policy:

```python
class HolidayReturnPolicy:
    def __init__(self, standard_policy: StandardReturnPolicy):
        self.standard_policy = standard_policy

    def return_period_for(self, order: Order) -> ReturnPeriod:
        standard_period = self.standard_policy.return_period_for(order)
        if order.ordered_on.month != 12:
            return standard_period
        return standard_period.extended_to(date(order.ordered_on.year + 1, 1, 31))
```

The standard policy did not change. The value object did not change. The new rule is added next to the existing ones, and its intent is obvious from its name.

## Tests that read like the business

```python
def test_return_period_ends_14_days_after_delivery():
    order = an_order(delivered_on=date(2026, 3, 1))

    assert StandardReturnPolicy().return_period_for(order).ends_on == date(2026, 3, 15)


def test_return_is_allowed_on_the_last_day_of_the_return_period():
    period = ReturnPeriod(ends_on=date(2026, 3, 15))

    assert period.allows_return_on(date(2026, 3, 15))


def test_december_orders_can_be_returned_until_january_31():
    order = an_order(ordered_on=date(2026, 12, 10), delivered_on=date(2026, 12, 12))

    period = HolidayReturnPolicy(StandardReturnPolicy()).return_period_for(order)

    assert period.ends_on == date(2027, 1, 31)


def test_holiday_policy_never_shortens_the_standard_return_period():
    order = an_order(ordered_on=date(2026, 12, 30), delivered_on=date(2027, 1, 25))

    period = HolidayReturnPolicy(StandardReturnPolicy()).return_period_for(order)

    assert period.ends_on == date(2027, 2, 8)
```

The last test is a question the developer would never have asked with the old code: what happens to a December order that is delivered late in January? With an explicit concept, the question becomes obvious. Customer service had an answer immediately: the customer always gets whichever period ends later.

You could show these test names to a customer service lead and they would understand them. That is a good sign that the concepts in the code match the concepts of the business.

## Where it gets hard

**Finding the right name.** Do not invent names. Listen to the people who work in the domain and use their words. If customer service says "return period", the class is called `ReturnPeriod`, not `DeadlineCalculator`. If they use two different words for the same thing, or the same word for two different things, that is worth a conversation.

**Not every number is a concept.** Making everything explicit leads to a codebase full of tiny classes that nobody asked for. My test: does the business talk about it? Would it change for a business reason? Is it used in more than one place? If the answer is yes to any of these, it deserves a name.

**Renaming in a legacy codebase is scary.** Introducing a concept often means touching many places. This is where the tests from the [first step](TODO-link) pay off. Introduce the new concept next to the old code, move the callers one by one, and delete the old version when nothing uses it anymore.

## Why I love this part

Of all the work involved in making a legacy system maintainable, this is my favourite part. Finding an implicit concept feels like finding the missing piece of a puzzle. Suddenly the strange detours in the code make sense: they were all working around something that had no name.

Then comes the question of how to express that concept in the structure of the code. A value object? A policy? A state? And then the moment when I replace the old code with the new concept, and a tangle of conditions collapses into a few lines that read like a sentence from the business.

Complicated code becomes simple, beautiful and stable. Not because anyone was clever, but because the code finally says what it means.
