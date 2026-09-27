---
layout: single
title: "Responsibilities in the right layer"
excerpt: "Business rules in SQL, date formatting in the backend, the system clock in the domain. When responsibilities sit on the wrong layer, every change spreads. Where each responsibility belongs, and why the dependency rule holds it all together."
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/transit-map.jpg
tags:
  [
    clean-architecture,
    hexagonal-architecture,
    software-architecture,
    refactoring,
    maintainability,
  ]
---

This post is the last part of the series [The hidden cost of unmaintainable code](TODO-link). A new developer has to implement a small change in an online shop: "Orders placed in December can be returned until January 31." They have [put tests in place](TODO-link), [given the return period a name](TODO-link), [merged its copies into one place](TODO-link) and [split the class that served too many departments](TODO-link). One question is left: where does each piece actually belong?

While consolidating the return period, the developer keeps finding it in places where it has no business being. The API builds a ready-made sentence for the shop:

```python
"return_hint": f"Return until {order.delivered_at + timedelta(days=14):%d.%m.%Y}",
"return_hint_color": "red" if (order.delivered_at + timedelta(days=14) - datetime.now()).days <= 3 else "grey",
```

The customer service report has the rule in its `WHERE` clause. And the `Order` class is an ORM model that also contains business logic and reads the system clock:

```python
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    status = Column(Integer)
    ordered_at = Column(DateTime)
    delivered_at = Column(DateTime)

    def is_returnable(self):
        return self.status == 4 and self.delivered_at + timedelta(days=14) >= datetime.now()
```

Every one of these works. And every one of them is a place where a change to the return period has to be made, tested and deployed, even though the UI, the database and the ORM should not care about return periods at all.

## Why the layer matters

When a responsibility sits on the wrong layer, two things happen.

First, changes spread. A business rule in the SQL means a business change needs a database change. A date format in the backend means a design change needs a backend deployment. Layers that should be independent get pulled into every change.

Second, the code gets harder to understand. To know how the return period works, the developer has to read Python, SQL, JavaScript and an email template. To test it, they need a database and a frozen system clock. The cognitive load of a simple rule is spread across the entire stack.

The idea behind layering is simple: every layer has one kind of responsibility, and only that one.

- The **UI** decides how things look.
- **Persistence** stores and restores state.
- The **domain** knows the business rules, and nothing about technology.
- The **application layer** orchestrates the domain and keeps external dependencies behind ports.

Let us go through them one at a time.

## The UI: only how things look

The API above does two jobs that belong to the UI: formatting a date and choosing a colour. It also contains yet another copy of the return period rule.

After the refactoring, the API delivers facts, not presentation:

```python
"return_period_ends_on": order.return_period.ends_on.isoformat(),
"return_period_ends_soon": order.return_period.ends_soon(today),
```

And the frontend decides how to show them:

```javascript
function returnHint(order) {
  return {
    text: `Return until ${formatDate(order.returnPeriodEndsOn)}`,
    urgent: order.returnPeriodEndsSoon,
  };
}
```

Why is "ends soon" in the domain and not in the UI? Because it is a business rule. Customer service also sends a "last chance to return" email three days before the period ends. If the UI decided what "soon" means, that decision would exist twice. Whether "soon" is shown in red, with an icon or not at all is a UI decision.

This is the humble object pattern: the UI contains as little logic as possible, so there is little to test. I verify the backend communication with smoke tests and test the UI manually. All the behaviour worth testing automatically lives in layers that are easy to test.

## Persistence: store and restore state

The customer service report had the return period in its query:

```sql
SELECT * FROM orders
WHERE status = 4
  AND delivered_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 weeks';
```

This is a business rule written in SQL. When the December rule comes, someone has to remember to change this query too. And nobody will, because nobody thinks of a report when they change a business rule.

The fix is to let the domain make the decision once, and let persistence store the result. The return policy is applied when the order is delivered:

```python
def mark_delivered(self, on: date, return_policy: ReturnPolicy):
    self.status = OrderStatus.DELIVERED
    self.delivered_on = on
    self.return_period = return_policy.return_period_for(self)
```

The repository stores the end of the return period as a column, like any other state:

```python
class PostgresOrderRepository(OrderRepository):
    def save(self, order: Order):
        self.connection.execute(
            "UPDATE orders SET status = %s, delivered_on = %s, return_period_ends_on = %s WHERE id = %s",
            (order.status.name, order.delivered_on, order.return_period.ends_on, order.id),
        )
```

And the report no longer knows any rule. It filters on state:

```sql
SELECT id, customer_name, return_period_ends_on FROM orders
WHERE status = 'DELIVERED'
  AND return_period_ends_on >= %(today)s;
```

The query is fast, it is simple, and it can never disagree with the domain again, because it does not decide anything.

## The domain: free of technical details

The ORM model mixed three things: the database mapping, the business rule and the system clock. That makes the rule hard to test and ties the business logic to a specific framework.

After the refactoring, the domain is plain Python:

```python
@dataclass
class Order:
    id: int
    ordered_on: date
    status: OrderStatus
    delivered_on: date | None = None
    return_period: ReturnPeriod | None = None

    def mark_delivered(self, on: date, return_policy: ReturnPolicy):
        self.status = OrderStatus.DELIVERED
        self.delivered_on = on
        self.return_period = return_policy.return_period_for(self)

    def request_return(self, today: date):
        if not self.is_delivered():
            raise OrderNotDelivered(self.id)
        if not self.return_period.allows_return_on(today):
            raise ReturnPeriodExpired(self.return_period)
        self.status = OrderStatus.RETURN_REQUESTED

    def is_delivered(self) -> bool:
        return self.status == OrderStatus.DELIVERED
```

No ORM, no database, no `datetime.now()`. The current day is passed in. The mapping between the database row and the domain object lives in the repository, where it belongs.

The domain tests need nothing but the domain:

```python
def test_return_is_rejected_after_the_return_period_has_ended():
    order = a_delivered_order(return_period=ReturnPeriod(ends_on=date(2026, 3, 15)))

    with pytest.raises(ReturnPeriodExpired):
        order.request_return(today=date(2026, 3, 16))
```

## The application layer: orchestrate and decouple

Someone has to load the order, ask the clock for today, let the domain decide, save the result and notify the customer. That is the job of the application layer:

```python
class RequestReturn:
    def __init__(self, orders: OrderRepository, clock: Clock, notifications: CustomerNotifications):
        self.orders = orders
        self.clock = clock
        self.notifications = notifications

    def execute(self, order_id: int):
        order = self.orders.get(order_id)
        order.request_return(today=self.clock.today())
        self.orders.save(order)
        self.notifications.return_confirmed(order)
```

`OrderRepository`, `Clock` and `CustomerNotifications` are ports: interfaces written in the language of the application. The implementations are adapters on the outside. The clock is a good example of how small such a port can be:

```python
class Clock(ABC):
    @abstractmethod
    def today(self) -> date:
        ...


class SystemClock(Clock):
    def __init__(self, timezone: ZoneInfo):
        self.timezone = timezone

    def today(self) -> date:
        return datetime.now(self.timezone).date()
```

Remember the question of which time zone the return period uses? Customer service decided: the shop's local time. That decision now lives in exactly one place, the configuration of the `SystemClock`. In tests, a `FixedClock` returns whatever day the test needs.

For external systems like payment providers, the same pattern needs a bit more structure. I described that in detail in [Foreign systems will change - here's how to be ready](https://www.manuel-holzrichter.de/2026/03/29/foreign-systems-will-change-heres-how-to-be-ready/).

## The dependency rule holds it together

All of this only works because of one rule: dependencies point inward.

```
UI  ──►  Application  ──►  Domain
              ▲
Adapters ─────┘   (implement the ports: database, email, clock)
```

The domain depends on nothing. The application layer depends on the domain and defines the ports it needs. The UI and the adapters depend on the application layer, never the other way around. The domain never imports anything from the database, the web framework or the mail library.

That is why the December rule could be implemented without touching the database, the frontend or the email. The rule lives in the domain, and nothing in the domain knows about any of those things. Robert C. Martin calls this the dependency rule in *Clean Architecture*. Alistair Cockburn described the same idea earlier as hexagonal architecture, or ports and adapters.

## Where it gets hard

**Stored decisions versus computed ones.** Storing the end of the return period at delivery makes the report simple and consistent. But it also means a rule change only applies to orders delivered after the change. For the December rule, that is exactly right. For other rules, the business might want it to apply retroactively. That is a business question, not a technical one, and it is worth asking before choosing.

**Mapping code.** Separating the domain from the ORM means writing code that maps between database rows and domain objects. It feels like boilerplate. In my experience, it is a small price for a domain that can be understood and tested without a database.

**Not every piece of software needs all of this.** A simple form that writes to a table does not need a domain layer. The layering pays off where there are business rules worth protecting. The return period is one. Most legacy systems have many.

## Every responsibility in its place

At the end of the series, the developer's December ticket is one new class and one new test. Not because the rule got simpler, but because every responsibility around it found its place. The UI shows what it is given. Persistence stores what it is told. The domain decides. The application layer orchestrates.

The result is not clever. It is simple, boring code that does what it should. And the next developer who changes it will not have to be afraid.
