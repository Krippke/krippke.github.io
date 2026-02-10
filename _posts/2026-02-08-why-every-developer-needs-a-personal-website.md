---
layout: single

title: "Why every developer needs a personal website"
date: 2026-02-08 12:00:00 +0100
last_modified_at: 2026-02-08T22:52:58+01:00
header:
  teaser: /assets/images/personal-website.jpg
author: "Manuel Holzrichter"
tags:
  [
    personal website,
    software development,
    communication,
    github pages,
    writing,
    AI,
  ]
---

Let me paint you a picture. You just spent three weeks building an elegant event-driven architecture. Clean separation of concerns, proper domain boundaries, the works. Now your product owner asks you to explain it to a stakeholder who has never written a line of code in their life. You open your mouth and... it comes out like a stack trace. Technical. Dense. Meaningless to anyone outside your bubble.

```
  +------------------+                  +------------------+
  |   if (event) {   |                  |                  |
  |     publish(msg) |  -- explain -->  |    ... what?     |
  |     await sub()  |                  |                  |
  +------------------+                  +------------------+
       Developer                           Stakeholder
```

I've been there. More than once. And the uncomfortable truth I had to accept after 15+ years of building software is this: **the code was never the hard part. Communication was.**

## The Skill Nobody Teaches You in a Tutorial

As developers, we spend thousands of hours sharpening our technical skills. New frameworks, design patterns, architectural principles. We learn it all. But the skill that actually determines whether our projects succeed? Communicating with the people who aren't developers.

Domain experts. Stakeholders. End users. The people who know _what_ needs to be built but have no idea _how_. Our job isn't just to write code. It's to translate between their world and ours. And that translation requires practice.

Something I wish I'd learned earlier: putting yourself in the listener's shoes is a muscle. It weakens when you don't use it. And blogging on a personal website is one of the most effective ways to train it.

## Why Blogging Is Communication Training in Disguise

When you write a blog post, you're forced to do something remarkable: take a concept that lives as intuition in your head and turn it into structured, understandable text. You have to choose the right level of abstraction. You have to anticipate what your reader doesn't know. You have to find analogies that bridge the gap between your expertise and their understanding.

This is _exactly_ what happens in a meeting with a stakeholder. Except in a blog post, you get to iterate. You can rewrite a paragraph five times until it clicks. You can let it sit overnight and realize your explanation had a blind spot. You can't do that in a live conversation, but the practice transfers.

Every post you publish is a practice run for the conversations that actually matter. The ones where misunderstanding costs weeks of rework, where a well-chosen metaphor saves a project from going sideways.

I wrote about [the role of writing](/2025/05/05/the-role-of-writing/) before, about how writing debugs your thinking. A personal website takes that principle and makes it a habit. Not a one-off exercise, but a continuous practice of clarity.

## In the Age of AI, Communication Is Your Multiplier

Here's where it gets interesting. We're living in an era where AI can generate code, write documentation, and scaffold entire applications. The bottleneck has shifted. It's no longer about _typing speed_ or _syntax knowledge_. It's about how clearly you can express what you want.

Prompt engineering — the skill everyone talks about — is really just communication skills applied to machines. The developers who get the best results from AI tools are the ones who can express intent clearly. They know how to provide context, define constraints, and describe desired outcomes in clear terms. Sound familiar? It's the same skill you need with stakeholders, just pointed at a different audience.

Clear communication has become a multiplier on everything you do. It makes your meetings more productive, your documentation more useful, your AI interactions more effective, and your code reviews more constructive. A personal website where you regularly practice this skill isn't a nice-to-have anymore. It's a competitive advantage.

## Remove All Friction With GitHub Pages

Now, I know what you're thinking. "I tried having a website once. Then I had to update WordPress, renew my SSL certificate, migrate my database, and patch a security vulnerability. By the time I was done, I had zero motivation left to actually write."

I get it. Traditional web hosting is a maintenance tax that kills motivation. That's why I run this site on GitHub Pages — and why I think it's the perfect setup for developers.

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

The developer experience is dead simple: write a Markdown file, `git push`, done. GitHub handles the build, the hosting, the SSL, everything. No servers to patch. No databases to back up. No hosting bills. Zero maintenance. Your content lives in a Git repository — version-controlled, portable, and yours forever.

It's the same workflow you already use every day. No context switching, no new tools to learn. Just your editor, your terminal, and your thoughts. The best tool is the one you actually use, and GitHub Pages removes every excuse not to.

## Start Writing, Not Showcasing

Here's my challenge to you: don't build a personal website as a polished portfolio piece. Don't spend weeks tweaking CSS or choosing the perfect color scheme. That's procrastination dressed up as productivity.

Instead, start writing. Pick a topic you explained to someone last week — a design decision, a debugging approach, a lesson learned. Write it down as if you're explaining it to a smart colleague who works in a different domain. Publish it. Then do it again next month.

You'll notice something after a few posts: your ability to communicate complex ideas improves. Not just in writing, but in meetings, in code reviews, in every conversation where you need to make yourself understood. The personal website is just the training ground. The real payoff happens everywhere else.

Your future stakeholders will thank you. And so will your AI tools.
