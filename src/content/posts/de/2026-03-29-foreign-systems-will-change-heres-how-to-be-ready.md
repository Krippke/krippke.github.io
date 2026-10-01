---
title: "Fremdsysteme werden sich ändern – so bist du vorbereitet"
excerpt: "Externe APIs ändern sich ohne Vorwarnung. Wie Adapter und hexagonale Architektur Fremdsysteme an der Grenze deiner Codebasis halten."
date: 2026-03-29 09:00:00 +0100
updated: 2026-03-29T09:00:00+01:00
teaser: /assets/images/two-languages.jpg
tags: [software-architecture, hexagonal-architecture, integration, adapters, clean-code]
slug: fremdsysteme-werden-sich-aendern
---

Freitagnachmittag, 16:47 Uhr. Ein Zahlungsanbieter spielt ein „kleines“ API-Update aus. Niemand bemerkt es. Am Montagmorgen kommen die ersten Kundenbeschwerden. Bestellungen scheitern im Checkout. Der Entwickler in Rufbereitschaft fängt an zu graben. Der Zahlungsanbieter hat die Struktur seiner Antwort geändert – ein verschachteltes Objekt, das vorher flach war, ein Feld, das von `transaction_id` in `txn_id` umbenannt wurde. Kleinkram. Aber die alte Struktur war in vierzehn Dateien über drei Services hinweg durchgesickert. Domänenlogik, Validierungsregeln, sogar E-Mail-Templates haben direkt auf die Feldnamen des Anbieters verwiesen. Der Fix hat drei Tage gedauert. Die Änderung selbst war einfach. Aber das Fremdsystem hatte sich überall ausgebreitet.

Ich habe dieses Muster öfter gesehen, als mir lieb ist. Ein Team bindet ein externes System an und nutzt dessen Datenstrukturen direkt im eigenen Domänencode. Alles funktioniert, bis sich das externe System ändert. Dann beginnt das Gerangel.

Der Fachbegriff dafür ist Kopplung. Aber ich glaube, es gibt eine nützlichere Sichtweise. Fremdsysteme sprechen eine andere Sprache als deine Anwendung. Wenn du diese Sprache in deine Domäne durchsickern lässt, verschmutzt du genau den Ort in deiner Codebasis, der glasklar sein sollte: das Modell deines Geschäfts.

## Das Problem: wenn fremde Konzepte in deine Domäne eindringen

Jedes Fremdsystem bringt sein eigenes Vokabular mit. Ein Zahlungsanbieter spricht von `charges`, `intents` und `disputes`. Ein Versanddienst spricht von `parcels`, `carriers` und `tracking_events`. Deine Domäne muss vielleicht nur wissen, dass eine Bestellung bezahlt ist und ein Paket unterwegs ist.

Wenn du die Strukturen des Fremdsystems direkt in deinem Domänencode verwendest, wird deine Domäne unscharf. Entwickler, die den Code lesen, müssen nicht nur die Geschäftslogik verstehen, sondern auch das Vokabular jedes externen Systems, das ihr anbindet. Konzepte, die selbsterklärend sein sollten, werden mit fremden Begriffen zugemüllt. Das sind konzeptionelle Schulden, und sie wachsen, ohne dass es jemand merkt.

Dazu kommt: Änderungen im Fremdsystem ziehen sich durch deine ganze Codebasis. Ein umbenanntes Feld, eine umgebaute Antwort, ein abgekündigter Endpunkt – jede dieser Änderungen kann Anpassungen in Domänenlogik erzwingen, die mit der Entscheidung des externen Systems, sich weiterzuentwickeln, nichts zu tun hat. Und wenn tatsächlich etwas kaputtgeht, muss der Betrieb raten. War es der Zahlungsanbieter? Der Versanddienst? Welcher Endpunkt? Welches Feld? Ohne klare Grenzen wird Fehlersuche zur Archäologie.

## Die Lösung: Ports, Adapter und Wrapper

Mein Ansatz stützt sich auf hexagonale Architektur, ergänzt sie aber um eine praktische Schicht für den Umgang mit Fremdsystemen im Entwicklungsalltag. Vier Bausteine:

**Port**: ein Interface, das beschreibt, was deine Anwendung braucht, in der Sprache deiner Anwendung. Der Port weiß nichts über das Fremdsystem.

**Wrapper**: eine kleine Klasse, die für genau eine Fähigkeit des Fremdsystems verantwortlich ist. Ein Endpunkt, ein Wrapper.

**Adapter**: die Übersetzungsschicht. Er implementiert den Port, indem er Wrapper orchestriert und fremde Konzepte auf Domänenkonzepte abbildet.

**Smoke-Tests und ein APITester**: Prüfwerkzeuge, die die Verbindung ehrlich halten.

Ich gehe jeden dieser Bausteine an einem konkreten Beispiel durch. Angenommen, deine Anwendung muss Zahlungen abwickeln, und du bindest einen Anbieter namens PayCorp an.

## Ports: definiere, was du brauchst, nicht was sie anbieten

Der Port ist ein Vertrag, geschrieben aus der Perspektive deiner Anwendung. Er erwähnt PayCorp nicht. Er erwähnt ihre API nicht. Er beschreibt, was deine Domäne braucht.

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

`Money`, `PaymentResult`, `PaymentStatus`, `RefundResult` – das sind alles Typen deiner Domäne. Deine Geschäftslogik hängt von diesem Interface ab und von nichts anderem. Wenn du PayCorp morgen gegen einen anderen Anbieter austauschst, ändert sich der Domänencode nicht. Nur der Adapter.

## Wrapper: ein Endpunkt, eine Klasse

Ein Wrapper macht genau eine Fähigkeit des Fremdsystems für die Codebasis verfügbar. Hat PayCorp einen Endpunkt `POST /v2/charges` und einen Endpunkt `GET /v2/charges/{id}`, bekommst du zwei Wrapper. Nicht einen. Zwei.

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

Warum fasst man die beiden nicht in einer einzigen Klasse `PayCorpClient` zusammen? Weil eine Komponente umso komplexer wird, je mehr Verantwortungen sie hat. Wir wollen einfachen, langweiligen, wartbaren Code. Jeder Wrapper macht genau eine Sache. Du kannst ihn in dreißig Sekunden lesen. Du kannst ihn isoliert testen. Du kannst ihn ersetzen, ohne irgendetwas anderes anzufassen. Wenn PayCorp den Endpunkt zum Anlegen von Charges ändert, passt du einen Wrapper an. Der Rest des Systems bekommt davon nicht einmal etwas mit.

Beim ersten Aufsetzen fühlt sich das vielleicht übertrieben an. Aber spätestens wenn ein Fremdsystem zum dritten Mal einen Endpunkt ändert und du das an einer einzigen, offensichtlichen Stelle behebst, willst du nicht mehr zurück.

## Adapter: wo zwei Welten aufeinandertreffen

Im Adapter passiert die Übersetzung. Er implementiert deinen Port, nutzt intern Wrapper und bildet die Antworten des Fremdsystems auf deine Domänentypen ab.

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

Achte darauf, wo die fremden Konzepte leben. `txn_id`, `state`, `amount_cents`, `COMPLETED` – das gesamte Vokabular von PayCorp steckt in diesem Adapter. Die Domäne sieht es nie. Wenn PayCorp `txn_id` wieder in `transaction_id` umbenennt, änderst du eine Zeile in einer Methode eines Adapters. Dein Domänencode, deine Tests, deine Geschäftsregeln – nichts davon ist betroffen.

Das ist die Grenze. Auf der einen Seite die Welt von PayCorp. Auf der anderen deine. Der Adapter ist der einzige Ort, an dem sich beide treffen.

## Smoke-Tests: Vertrauen ist gut, Kontrolle ist besser

Jeder Wrapper bekommt einen Smoke-Test. Ein Smoke-Test ist eine winzige ausführbare Main. Sie baut die nötige Infrastruktur auf, ruft den Wrapper auf und gibt das Ergebnis aus. Mehr nicht.

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

Du führst ihn aus, du siehst die Ausgabe, du weißt, ob es funktioniert. Genau darum geht es.

Warum manuelle Smoke-Tests statt automatisierter Integrationstests? Weil Integrationstests einen definierten Zustand brauchen. Du brauchst einen bekannten Ausgangspunkt, vorhersagbares Verhalten und konsistente Antworten. Bei Fremdsystemen hast du diesen Luxus selten. Sandbox-Umgebungen sind instabil. Testkonten laufen ab. Rate Limits kommen dazwischen. Stabile automatisierte Tests gegen ein System zu pflegen, das du nicht kontrollierst, ist ein Kampf, den du nicht gewinnst.

Smoke-Tests haben einen anderen Zweck. In der ersten Entwicklungsphase geben sie dir einen schnellen Weg zu prüfen, ob dein Wrapper wirklich korrekt mit dem Fremdsystem spricht. Wenn in Produktion etwas kaputtgeht, hast du ein Werkzeug, um das Problem nachzustellen und zu analysieren. Und wenn das Fremdsystem eine neue API-Version ankündigt, kannst du damit die Kompatibilität prüfen, bevor du deployst.

Sie sind ein Werkzeug für Entwickler, um Sicherheit zu gewinnen, kein Werkzeug für die CI-Pipeline, um Releases freizugeben oder zu blockieren.

## Der APITester: ein Sicherheitsnetz für den Betrieb

Der APITester ist ein eigenes Thema, getrennt von den Smoke-Tests. Smoke-Tests sind ein Werkzeug für Entwickler, der APITester dagegen wird zusammen mit deiner Anwendung in Produktion deployt. Er orchestriert die Wrapper-Klassen direkt und prüft, ob die Endpunkte des Fremdsystems erreichbar und kompatibel sind.

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

Stell das als CLI-Befehl namens `check-connectivity` bereit, und der Betrieb kann die Kompatibilität jederzeit selbst prüfen. Kein Raten, kein Wühlen in Logs, kein Warten darauf, dass die Entwickler aufwachen.

Angenommen, PayCorp spielt an einem Samstag eine inkompatible Änderung aus. Das Monitoring meldet steigende Fehlerraten. Der Techniker in Rufbereitschaft führt `check-connectivity` aus und sieht:

```
CreateCharge: FAILED — Missing txn_id in response
GetCharge:    OK
```

Innerhalb von Sekunden weiß der Betrieb genau, welche Fähigkeit kaputt ist. Er kann mit präzisen Informationen eskalieren und prüfen, ob es einen Workaround gibt, ohne den Domänencode oder die Logik des Adapters verstehen zu müssen. Der APITester gibt ihm eine klare, ehrliche Antwort.

## Zieh die Grenze am Adapter

Fremdsysteme werden sich ändern. Neue API-Versionen, umbenannte Felder, abgekündigte Endpunkte, geänderte Authentifizierung – all das wird passieren, und zwar nach dem Zeitplan von jemand anderem. Das Einzige, was du kontrollierst, ist, wie tief du es in deinen Code lässt, bevor du dich damit beschäftigen musst.

Wenn du das nächste Mal ein Fremdsystem anbindest, zieh die Grenze am Adapter. Lass die Wrapper die rohe Kommunikation übernehmen. Lass den Adapter übersetzen. Lass deine Domäne sauber. Und gib deinem Betriebsteam eine Möglichkeit zu prüfen, ob die Welt außerhalb deiner Anwendung noch die Sprache spricht, die du erwartest.
