---
title: "Warum jeder Entwickler eine eigene Website braucht"
excerpt: "Warum jeder Entwickler eine eigene Website bauen sollte: Du übst, technische Arbeit für Nicht-Techniker zu erklären, behältst deine Inhalte und bringst deine Karriere voran."
date: 2026-02-08 12:00:00 +0100
updated: 2026-02-08T22:52:58+01:00
teaser: /assets/images/personal-website.jpg
tags: [personal-website, software-development, communication, github-pages, writing, ai]
slug: warum-jeder-entwickler-eine-eigene-website-braucht
---

Stell dir folgende Szene vor. Du hast gerade drei Wochen lang eine elegante eventgetriebene Architektur gebaut. Saubere Trennung der Zuständigkeiten, ordentliche Domänengrenzen, das volle Programm. Jetzt bittet dich dein Product Owner, das Ganze einem Stakeholder zu erklären, der in seinem Leben noch keine Zeile Code geschrieben hat. Du machst den Mund auf und … heraus kommt etwas wie ein Stacktrace. Technisch. Dicht. Bedeutungslos für jeden außerhalb deiner Blase.

```
  +------------------+                  +------------------+
  |   if (event) {   |                  |                  |
  |     publish(msg) |  -- explain -->  |    ... what?     |
  |     await sub()  |                  |                  |
  +------------------+                  +------------------+
       Developer                           Stakeholder
```

Das kenne ich. Mehr als einmal. Und die unbequeme Wahrheit, die ich nach über 15 Jahren Softwareentwicklung akzeptieren musste, lautet: **Der Code war nie der schwierige Teil. Die Kommunikation war es.**

## Die Fähigkeit, die dir kein Tutorial beibringt

Als Entwickler verbringen wir Tausende Stunden damit, unsere technischen Fähigkeiten zu schärfen. Neue Frameworks, Entwurfsmuster, Architekturprinzipien. Wir lernen das alles. Aber die Fähigkeit, die tatsächlich darüber entscheidet, ob unsere Projekte gelingen? Die Kommunikation mit den Menschen, die keine Entwickler sind.

Fachexperten. Stakeholder. Endanwender. Die Menschen, die wissen, _was_ gebaut werden muss, aber keine Ahnung haben, _wie_. Unser Job ist nicht nur, Code zu schreiben. Er besteht darin, zwischen ihrer Welt und unserer zu übersetzen. Und dieses Übersetzen braucht Übung.

Etwas, das ich gern früher gelernt hätte: Sich in die Lage des Zuhörers zu versetzen, ist ein Muskel. Er wird schwächer, wenn du ihn nicht benutzt. Und auf einer eigenen Website zu bloggen, ist eine der wirksamsten Methoden, ihn zu trainieren.

## Warum Bloggen verkapptes Kommunikationstraining ist

Wenn du einen Blogartikel schreibst, zwingt dich das zu etwas Bemerkenswertem: Du musst ein Konzept, das als Intuition in deinem Kopf lebt, in einen strukturierten, verständlichen Text verwandeln. Du musst die richtige Abstraktionsebene wählen. Du musst vorhersehen, was dein Leser nicht weiß. Du musst Analogien finden, die die Lücke zwischen deinem Fachwissen und seinem Verständnis überbrücken.

Genau _das_ passiert in einem Meeting mit einem Stakeholder. Nur dass du in einem Blogartikel iterieren kannst. Du kannst einen Absatz fünfmal umschreiben, bis er sitzt. Du kannst ihn über Nacht liegen lassen und merken, dass deine Erklärung einen blinden Fleck hatte. In einem Live-Gespräch geht das nicht, aber die Übung überträgt sich.

Jeder Artikel, den du veröffentlichst, ist ein Probelauf für die Gespräche, auf die es wirklich ankommt. Die, in denen ein Missverständnis Wochen an Nacharbeit kostet und in denen eine gut gewählte Metapher ein Projekt davor bewahrt, aus dem Ruder zu laufen.

Ich habe schon über :series-link[die Rolle des Schreibens]{slug="the-role-of-writing"} geschrieben, darüber, wie Schreiben dein Denken debuggt. Eine eigene Website nimmt dieses Prinzip und macht daraus eine Gewohnheit. Keine einmalige Übung, sondern eine kontinuierliche Praxis der Klarheit.

## Im Zeitalter der KI ist Kommunikation dein Multiplikator

Jetzt wird es interessant. Wir leben in einer Zeit, in der KI Code generieren, Dokumentation schreiben und ganze Anwendungen aufsetzen kann. Der Engpass hat sich verschoben. Es geht nicht mehr um _Tippgeschwindigkeit_ oder _Syntaxwissen_. Es geht darum, wie klar du ausdrücken kannst, was du willst.

Prompt Engineering – die Fähigkeit, über die alle reden – ist eigentlich nur Kommunikationsfähigkeit, angewandt auf Maschinen. Die Entwickler, die mit KI-Werkzeugen die besten Ergebnisse erzielen, sind diejenigen, die ihre Absicht klar ausdrücken können. Sie wissen, wie man Kontext liefert, Rahmenbedingungen festlegt und gewünschte Ergebnisse klar beschreibt. Kommt dir das bekannt vor? Es ist dieselbe Fähigkeit, die du bei Stakeholdern brauchst, nur auf ein anderes Publikum gerichtet.

Klare Kommunikation ist zu einem Multiplikator für alles geworden, was du tust. Sie macht deine Meetings produktiver, deine Dokumentation nützlicher, deine Arbeit mit KI effektiver und deine Code Reviews konstruktiver. Eine eigene Website, auf der du diese Fähigkeit regelmäßig übst, ist kein Nice-to-have mehr. Sie ist ein Wettbewerbsvorteil.

## Mit GitHub Pages alle Hürden beseitigen

Ich weiß, was du jetzt denkst. „Ich hatte mal eine Website. Dann musste ich WordPress aktualisieren, mein SSL-Zertifikat erneuern, meine Datenbank migrieren und eine Sicherheitslücke patchen. Als ich damit fertig war, hatte ich null Motivation mehr, tatsächlich etwas zu schreiben.“

Verstehe ich. Klassisches Webhosting ist eine Wartungssteuer, die jede Motivation killt. Deshalb betreibe ich diese Seite auf GitHub Pages – und deshalb halte ich es für das perfekte Setup für Entwickler.

```
  +-----------------------------------------------+
  |  ~ Terminal                            _ [] x |
  +-----------------------------------------------+
  |                                               |
  |  $ vim why-caching-matters.md                 |
  |  $ git add .                                  |
  |  $ git commit -m "New post"                   |
  |  $ git push                                   |
  |                                               |
  |  remote: Your site is published.              |
  |                                               |
  +-----------------------------------------------+
```

Die Developer Experience ist denkbar einfach: Markdown-Datei schreiben, `git push`, fertig. GitHub kümmert sich um den Build, das Hosting, SSL, um alles. Keine Server zum Patchen. Keine Datenbanken zum Sichern. Keine Hosting-Rechnungen. Null Wartung. Deine Inhalte liegen in einem Git-Repository – versioniert, portabel und für immer deine.

Es ist derselbe Workflow, den du ohnehin jeden Tag nutzt. Kein Kontextwechsel, keine neuen Werkzeuge zu lernen. Nur dein Editor, dein Terminal und deine Gedanken. Das beste Werkzeug ist das, das du tatsächlich benutzt, und GitHub Pages nimmt dir jede Ausrede.

## Fang an zu schreiben, statt dich zu präsentieren

Hier ist meine Herausforderung an dich: Bau deine eigene Website nicht als polierte Portfolio-Visitenkarte. Verbring nicht Wochen damit, am CSS zu feilen oder das perfekte Farbschema auszusuchen. Das ist Prokrastination, die sich als Produktivität verkleidet.

Fang stattdessen an zu schreiben. Such dir ein Thema aus, das du letzte Woche jemandem erklärt hast – eine Designentscheidung, eine Debugging-Strategie, eine Lektion, die du gelernt hast. Schreib es so auf, als würdest du es einem klugen Kollegen erklären, der in einer anderen Domäne arbeitet. Veröffentliche es. Und dann mach es nächsten Monat wieder.

Nach ein paar Artikeln wirst du etwas bemerken: Deine Fähigkeit, komplexe Ideen zu vermitteln, wird besser. Nicht nur beim Schreiben, sondern auch in Meetings, in Code Reviews, in jedem Gespräch, in dem du dich verständlich machen musst. Die eigene Website ist nur der Trainingsplatz. Der eigentliche Gewinn zeigt sich überall sonst.

Deine zukünftigen Stakeholder werden es dir danken. Und deine KI-Werkzeuge auch.
