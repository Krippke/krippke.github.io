---
layout: single

title: "Foreign systems will change — here's how to be ready"
date: 2024-01-11 11:51:49 +0100
header:
  teaser: /assets/images/typewriter.jpg
---

Friday afternoon, 4:47 PM. A payment provider rolls out a "minor" API update. No one notices. Monday morning, the first customer complaints come in. Orders are failing at checkout. The on-call developer starts digging. The payment provider changed the structure of their response — a nested object that used to be flat, a field renamed from `transaction_id` to `txn_id`. Small stuff. But the old structure had leaked into fourteen files across three services. Domain logic, validation rules, even email templates referenced the provider's field names directly. The fix took three days. Not because the change was complex. But because the foreign system had spread everywhere.

I have seen this pattern more times than I care to count. A team integrates an external system, uses its data structures directly in their domain code, and everything works fine — until the external system changes. Then comes the scramble.

The technical term for this is coupling. But I think there is a more useful way to look at it. Foreign systems speak a different language than your application. When you let that language leak into your domain, you pollute the one place in your codebase that should be crystal clear: the model of your business.

## The problem: when foreign concepts invade your domain

Every foreign system comes with its own vocabulary. A payment provider talks about `charges`, `intents`, and `disputes`. A shipping service talks about `parcels`, `carriers`, and `tracking_events`. Your domain might just need to know that an order was paid and a package is on its way.

When you use the foreign system's structures directly in your domain code, three things happen.

First, your domain becomes foggy. Developers reading the code have to understand not just the business logic, but also the vocabulary of every external system you happen to integrate with. Concepts that should be clear and self-explanatory become cluttered with foreign terms. This is conceptual debt, and it accumulates silently.

Second, changes in the foreign system ripple through your codebase. A renamed field, a restructured response, a deprecated endpoint — any of these can force changes in domain logic that had nothing to do with the external system's decision to evolve.

Third, detecting incompatibilities becomes a nightmare. When a foreign system changes and your application breaks, the operations team is left guessing. Was it the payment provider? The shipping service? Which endpoint? Which field? Without clear boundaries, troubleshooting turns into archaeology.

## The solution: ports, adapters, and wrappers

The approach I use draws from hexagonal architecture, but adds a practical layer that makes foreign systems manageable in day-to-day development. It consists of four building blocks:

**Port** — an interface that defines what your application needs, in your application's language. The port knows nothing about the foreign system.

**Wrapper** — a small class responsible for a single capability of the foreign system. One endpoint, one wrapper.

**Adapter** — the translation layer. It implements the port by orchestrating wrappers and mapping foreign concepts to domain concepts.

**Smoke tests and an APITester** — verification tools that keep the connection honest.

Let me walk through each of these with a concrete example. Say your application needs to process payments, and you integrate with a provider called PayCorp.

## Ports: define what you need, not what they offer

The port is a contract written from your application's perspective. It does not mention PayCorp. It does not mention their API. It describes what your domain needs.

```python
class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount: Money, reference: str) -> PaymentResult:
        ...

    @abstractmethod
    def get_status(self, payment_id: str) -> PaymentStatus:
        ...

    @abstractmethod
    def refund(self, payment_id: str) -> RefundResult:
        ...
```

`Money`, `PaymentResult`, `PaymentStatus`, `RefundResult` — these are all your domain's types. Your business logic depends on this interface and nothing else. If you swap PayCorp for a different provider tomorrow, the domain code does not change. Only the adapter does.

## Wrappers: one endpoint, one class

A wrapper makes a single capability of the foreign system available to the codebase. If PayCorp has a `POST /v2/charges` endpoint and a `GET /v2/charges/{id}` endpoint, you get two wrappers. Not one. Two.

```python
class CreatePayCorpCharge:
    def __init__(self, http_client: HttpClient, config: PayCorpConfig):
        self.http_client = http_client
        self.config = config

    def execute(self, payload: dict) -> dict:
        response = self.http_client.post(
            f"{self.config.base_url}/v2/charges",
            json=payload,
            headers=self.config.auth_headers,
        )
        response.raise_for_status()
        return response.json()
```

```python
class GetPayCorpCharge:
    def __init__(self, http_client: HttpClient, config: PayCorpConfig):
        self.http_client = http_client
        self.config = config

    def execute(self, charge_id: str) -> dict:
        response = self.http_client.get(
            f"{self.config.base_url}/v2/charges/{charge_id}",
            headers=self.config.auth_headers,
        )
        response.raise_for_status()
        return response.json()
```

Why not combine these into a single `PayCorpClient` class? Because the more responsibilities a component has, the more complex it gets. We want simple, boring, maintainable code. Each wrapper does exactly one thing. You can read it in thirty seconds. You can test it in isolation. You can replace it without touching anything else. When PayCorp changes their charge creation endpoint, you update one wrapper. The rest of the system does not even know it happened.

This might feel like overkill when you first set it up. But the third time a foreign system changes an endpoint and you fix it in a single, obvious place — you will not want to go back.

## Adapters: where two worlds meet

The adapter is where the translation happens. It implements your port, uses wrappers internally, and maps foreign system responses to your domain types.

```python
class PayCorpPaymentAdapter(PaymentGateway):
    def __init__(
        self,
        create_charge: CreatePayCorpCharge,
        get_charge: GetPayCorpCharge,
    ):
        self.create_charge = create_charge
        self.get_charge = get_charge

    def charge(self, amount: Money, reference: str) -> PaymentResult:
        response = self.create_charge.execute({
            "amount_cents": amount.to_cents(),
            "currency": amount.currency,
            "external_ref": reference,
        })
        return PaymentResult(
            payment_id=response["txn_id"],
            status=self._map_status(response["state"]),
        )

    def get_status(self, payment_id: str) -> PaymentStatus:
        response = self.get_charge.execute(payment_id)
        return self._map_status(response["state"])

    def _map_status(self, paycorp_state: str) -> PaymentStatus:
        mapping = {
            "COMPLETED": PaymentStatus.PAID,
            "PENDING": PaymentStatus.PROCESSING,
            "FAILED": PaymentStatus.FAILED,
        }
        return mapping.get(
            paycorp_state, PaymentStatus.UNKNOWN
        )
```

Notice where the foreign concepts live. `txn_id`, `state`, `amount_cents`, `COMPLETED` — all of PayCorp's vocabulary is contained in this adapter. The domain never sees it. If PayCorp renames `txn_id` back to `transaction_id`, you change one line in one adapter method. Your domain code, your tests, your business rules — none of them are affected.

This is the boundary. On one side, PayCorp's world. On the other, yours. The adapter is the only place where the two meet.

## Smoke tests: trust, but verify

Each wrapper gets a smoke test. A smoke test is a tiny executable main. It sets up the required infrastructure, calls the wrapper, and prints the result. Nothing more.

```python
if __name__ == "__main__":
    http_client = HttpClient()
    config = PayCorpConfig.from_env()
    wrapper = CreatePayCorpCharge(http_client, config)

    result = wrapper.execute({
        "amount_cents": 100,
        "currency": "EUR",
        "external_ref": "smoke-test-001",
    })
    print(f"txn_id: {result.get('txn_id')}")
    print(f"state:  {result.get('state')}")
```

You run it, you see the output, you know whether it works. That is the entire point.

Why manual smoke tests instead of automated integration tests? Because integration tests require defined state. You need a known starting point, predictable behavior, and consistent responses. With foreign systems, you rarely have that luxury. Sandbox environments are flaky. Test accounts expire. Rate limits interfere. Trying to maintain stable automated tests against a system you do not control is a fight you will not win.

Smoke tests serve a different purpose. During initial development, they give you a fast way to verify that your wrapper actually talks to the foreign system correctly. When something breaks in production, they give you a tool to reproduce and diagnose the issue. And when the foreign system announces a new API version, they let you verify compatibility before you deploy.

They are a developer's tool for building confidence, not a CI pipeline's tool for gatekeeping releases.

## The APITester: giving operations a safety net

The APITester is a separate concern from the smoke tests. While smoke tests are a developer tool, the APITester is deployed alongside your application in production. It orchestrates the wrapper classes directly to verify that the foreign system's endpoints are reachable and compatible.

```python
class PayCorpAPITester:
    def __init__(
        self,
        create_charge: CreatePayCorpCharge,
        get_charge: GetPayCorpCharge,
    ):
        self.create_charge = create_charge
        self.get_charge = get_charge

    def check_connectivity(self):
        self.create_charge.execute({
            "amount_cents": 1,
            "currency": "EUR",
            "external_ref": "connectivity-check",
        })
        print("CreateCharge: OK")

        self.get_charge.execute("connectivity-check")
        print("GetCharge: OK")
```

Expose this through a CLI command — `check-connectivity` — and operations has a way to verify compatibility on demand. No guessing, no log diving, no waiting for developers to wake up.

Picture this: PayCorp rolls out a breaking change on a Saturday. The monitoring picks up increased error rates. The on-call engineer runs `check-connectivity` and sees:

```
CreateCharge: FAILED — Missing txn_id in response
GetCharge:    OK
```

Within seconds, operations knows exactly which capability broke. They can escalate with precise information. They can check whether a workaround exists. They do not need to understand the domain code or the adapter logic. The APITester gives them a clear, honest answer.

## Draw the line at the adapter

Foreign systems will change. That is not a risk. That is a certainty. New API versions, renamed fields, deprecated endpoints, changed authentication — it will happen, and it will happen on someone else's schedule.

The question is not whether you will deal with it. The question is how deeply you let it into your code before you have to.

Next time you integrate a foreign system, draw the line at the adapter. Let wrappers handle the raw communication. Let the adapter translate. Let your domain stay clean. And give your operations team a way to check whether the world outside your application still speaks the language you expect.
