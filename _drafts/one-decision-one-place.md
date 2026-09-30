---
layout: single
title: "One decision, one place"
excerpt: "Every decision that lives in more than one place will drift. How duplicated decisions create bugs long before anyone touches them - and why two identical numbers are not always a duplication."
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/one-decision.jpg
tags:
  [
    dry,
    single-source-of-truth,
    refactoring,
    legacy-code,
    maintainability,
  ]
---

This post is part of the series {% include series-link.html slug="the-hidden-cost-of-unmaintainable-code" text="The hidden cost of unmaintainable code" %}. A new developer has to implement a small change in an online shop: "Orders placed in December can be returned until January 31." While {% include series-link.html slug="refactoring-legacy-code-without-fear" text="writing characterization tests" %}, they found out that the return period {% include series-link.html slug="making-implicit-concepts-explicit" text="did not exist as a concept" %}. Now they find out that it exists four times.

A support ticket lands in the team channel. A customer wanted to return a jacket. The shop told them the return period had ended on March 12. Customer service checked their report: the order was still returnable. The customer tried anyway, and the backend accepted the return. Three systems, three answers.

The developer goes looking and finds the return period in four places.

## Four places, three answers

In the backend, 14 days from delivery, in server time:

```kotlin
private fun withinDeadline(order: Order) =
    order.deliveredAt!!.plusDays(14) >= LocalDateTime.now()
```

In the frontend, 14 days from the order date:

```javascript
const returnPeriodEnd = addDays(order.orderedAt, 14);
```

In the customer service report, two weeks from delivery, in UTC:

```sql
SELECT * FROM orders
WHERE status = 4
  AND delivered_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 weeks';
```

And in the order confirmation email, hard-coded:

```
You can return your items within 14 days.
```

The jacket was ordered on February 26 and delivered on March 1. The frontend said March 12. The backend said March 15. The report, depending on the time of day, said March 14 or 15.

## Nobody made a mistake

The interesting part: none of these was wrong when it was written.

The frontend feature was built at a time when the order API did not return the delivery date. The developer used the order date because it was the closest thing available. The report was written by someone in a hurry who needed a list for customer service and wrote the query the way they understood the rule. The email text was written by marketing, who knew the terms and conditions said 14 days. Everyone made a reasonable decision with the information they had.

But they all made *the same* decision. Separately, at different times, with slightly different understanding. And separate copies of a decision drift apart. Not maybe. Inevitably.

This is what {% include series-link.html slug="making-implicit-concepts-explicit" text="implicit concepts" %} lead to. When a rule has no home in the code, everyone who needs it builds their own version. Each copy is a chance for a slightly different interpretation, and each future change has to find and update every copy. Miss one, and the system contradicts itself.

The December ticket did not create this bug. The bug had been in production for months. The ticket only made it visible, because it forced someone to look at all four places at the same time.

## Which one is right?

This is the question that turns a one-hour ticket into a three-day ticket. The code cannot answer it. Four implementations, four opinions.

So the developer does what I always do in this situation: write a test for one interpretation and take it to the people who know.

```kotlin
@Test
fun `return period ends 14 days after delivery`() {
    val period = StandardReturnPolicy().returnPeriodFor(
        orderedOn = LocalDate.of(2026, 2, 26),
        deliveredOn = LocalDate.of(2026, 3, 1),
    )

    assertEquals(LocalDate.of(2026, 3, 15), period.endsOn)
}
```

The test may be wrong. That is fine - any definition is better than no definition. Customer service confirms: from delivery, whole days, in the shop's local time. Now the decision is not just made, it is written down in a form that fails loudly if anyone ever changes it by accident.

## Make it once, ask for it everywhere

The fix is not to update four places. Four places will drift again. The fix is to make the decision in exactly one place and let everything else ask for the result.

The domain owns the rule. It applies the return policy once, when the order is delivered, and the order keeps its `ReturnPeriod`. Everything else gets the answer:

```kotlin
data class OrderDetails(
    val id: Long,
    val orderedOn: LocalDate,
    val returnPeriodEndsOn: LocalDate?,
)

fun Order.toDetails() = OrderDetails(
    id = id,
    orderedOn = orderedOn,
    returnPeriodEndsOn = returnPeriod?.endsOn,
)
```

The frontend no longer calculates anything. It displays a date it was given:

```javascript
const returnPeriodEnd = formatDate(order.returnPeriodEndsOn);
```

The confirmation email receives the same date:

```
You can return your items until {{ return_period_ends_on | format_date }}.
```

And the report no longer knows the rule. The persistence layer stores the end of the return period like any other state, and the query only filters on that stored value. How that works in detail is part of {% include series-link.html slug="responsibilities-in-the-right-layer" text="Responsibilities in the right layer" %}.

Now the December rule changes one place. The shop, the email and the report follow automatically, because they never knew the rule in the first place.

## When two identical things are not the same

After a refactoring like this, it is tempting to go hunting for every duplication in the codebase. The developer finds this in the module that generates the legal texts:

```kotlin
const val WITHDRAWAL_DAYS = 14L
```

And in the return policy:

```kotlin
const val RETURN_DAYS = 14L
```

Same number, same unit, both about customers sending things back. Merge them?

No. The first one is the statutory right of withdrawal. In the EU, customers can withdraw from an online purchase within 14 days of receiving the goods, and the law decides that number. The second one is the shop's voluntary return period. Marketing decides that number. Today they happen to be the same.

Merge them, and the December extension suddenly changes the legal withdrawal notice. Worse: the day marketing decides to shorten the return period for sale items to 7 days, the shop would also shorten a legal right, and nobody would notice until a lawyer does.

Sandi Metz put it well: "Duplication is far cheaper than the wrong abstraction." When Andy Hunt and Dave Thomas coined DRY in *The Pragmatic Programmer*, they did not talk about identical code. They wrote: "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system." Knowledge. Not text.

So the question is never "do these look the same?" The question is: "Is this the same decision, made by the same people, for the same reason?" If yes, it belongs in one place. If no, it needs two places, even if they look identical today. The payment term in the same shop is another example: also 14 days after delivery, but decided by accounting, not customer service. More about that in {% include series-link.html slug="one-responsibility-per-component" text="One responsibility per component" %}.

## Where it gets hard

**Finding all the copies.** Copies of a decision rarely look the same. `plusDays(14)`, `INTERVAL '2 weeks'`, `addDays(..., 14)` and "within 14 days" are all the same decision. Searching for the number helps. Characterization tests help more, because they force you to look at what each part of the system actually does.

**Deciding which copy is right.** Sometimes the answer is none of them. Sometimes each copy is right for a different part of the business, and you have just discovered that there are two concepts instead of one. Either way, this is not a decision the developer should make alone.

**Crossing system boundaries.** The frontend, the report and the email template are often owned by different people or teams. Consolidating the decision means agreeing on who owns it and who asks for it. That conversation is harder than the code, and more valuable.

## The calm of one place

There is a particular kind of calm that comes from merging a duplicated decision into one place. I know that the next developer who changes the return period will not produce a bug in the frontend, the report or the email. Not because they are careful, not because they know the codebase, but because there is only one place to change.

That is what I mean by maintainable code. It is not about elegance. It is about removing the opportunities for mistakes, so the people who come after us do not have to be perfect.
