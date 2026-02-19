---
layout: single

title: "Why you always need to be wrong"
date: 2026-02-19 12:00:00 +0100
last_modified_at: 2026-02-19T12:00:00+01:00
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/always-wrong.jpg
tags: [software development, mindset, productivity, quality, career]
---

Twelve years ago, I had a task that still crosses my mind regularly. We had a batch of manual, repetitive changes to push through a codebase. Nothing fancy. Find every location where a certain pattern appeared, apply the change, move on. The feedback loop was brutal. Fifteen to twenty minutes between deploying and seeing whether I had missed anything. So I did what any careful person would do. I went through the code slowly, methodically, and I triple-checked every location I found. I was focused and I was confident.

I deployed to dev. And there it was. I had missed locations. Not obscure, deeply nested ones. Obvious ones. The kind that made me stare at the screen and think: how did I walk right past these?

That question stuck with me longer than the bug itself. I was paying attention. I was not sloppy. So what happened?

After sitting with it for a while, I realized the problem was not in my process. It was in my assumption. I had assumed I was right. I was scanning the code looking for confirmation that I had covered everything, not actively hunting for what I might have missed. My brain had already decided the work was done. It was just looking for permission to move on.

That day, I changed the default. I stopped assuming I was right. I started assuming I was wrong. And the difference has been night and day.

## The trap of being right

There is a name for what happened to me: [confirmation bias](https://en.wikipedia.org/wiki/Confirmation_bias).

In 1960, psychologist Peter Wason ran an experiment that became a cornerstone of cognitive science. He asked participants to discover a rule governing a sequence of numbers. They could test their hypothesis by proposing new sequences. What Wason found was telling: people almost exclusively tested sequences that would confirm their guess. They did not try sequences that could disprove it. As a result, they became increasingly confident in wrong hypotheses.

This is what your brain does when you assume you are right. It stops looking for evidence that you are wrong. It filters selectively. It skips the parts that do not fit. Your brain is trying to save energy. Processing every piece of information without bias is expensive, so it takes shortcuts. On top of that, being wrong is uncomfortable. It creates cognitive dissonance and challenges your self-image. So your brain avoids it.

The [Dunning-Kruger effect](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect) adds another layer. The skills you need to do something well are often the same skills you need to judge whether you did it well. This creates a blind spot exactly where you need sight the most. You cannot see what you cannot see.

At scale, the consequences are ugly. Engineers at NASA knew about the O-ring problem on the Space Shuttle Challenger [for nine years](https://en.wikipedia.org/wiki/Space_Shuttle_Challenger_disaster) before the disaster. The assumption that the redundant second ring made it safe enough was never seriously challenged. Seven people died. Boeing's leadership [concluded the 737 MAX was safe](https://ethicsunwrapped.utexas.edu/engineering-ethics-and-the-boeing-scandal) even after two crashes that killed 346 people. The Titanic was marketed as unsinkable before it sank on its maiden voyage.

These are extreme examples. But the mechanism is the same one that got me with that batch of code changes. Confidence replaced verification. Nobody noticed until it was too late.

## Flip the default

Karl Popper built an entire [philosophy of science](https://plato.stanford.edu/entries/popper/) around the idea that the scientific method is not about proving theories right. It is about trying to prove them wrong. A theory has value only if it can be disproven. You do not gather evidence that supports your conclusion. You look for evidence that destroys it. Whatever survives that process is what you can trust.

Pilots figured this out a long time ago. They use [checklists](https://pmc.ncbi.nlm.nih.gov/articles/PMC9246552/) not because they forgot the steps. They use them because "I'm sure I remembered everything" is exactly the kind of assumption that kills people. Touch-verification procedures, dual-crew confirmation, and a non-punitive error culture replaced the old "unavoidable human error" mindset. Accident rates dropped sharply.

Research on [intellectual humility](https://greatergood.berkeley.edu/article/item/five_reasons_why_intellectual_humility_is_good_for_you) tells a similar story from the psychology side. People who acknowledge they might be wrong make better decisions, learn faster, and are far better at judging what they know versus what they do not know. This has [nothing to do with intelligence](https://www.nature.com/articles/s44159-022-00081-9). It is a separate, trainable skill. Smart people are just as susceptible to overconfidence as anyone else.

Gary Klein's [pre-mortem technique](https://en.wikipedia.org/wiki/Pre-mortem) takes this to the team level. Before a project starts, the team imagines it has already failed. Then everyone works backward to identify what went wrong. By assuming failure up front, teams surface threats that optimistic planning would have buried. It breaks groupthink. It gives permission to voice doubt.

## Validate before you execute

After that day twelve years ago, I restructured the way I work. The change was small but it changed everything: before I think about how to do a task, I think about how to validate the result.

The verification step comes first. Not as an afterthought, not as a box to check when I am done. It is the first thing I design. If I cannot figure out how to verify that the output is correct, I do not fully understand the task yet.

This flipped my entire relationship with mistakes. I no longer dread them. I expect them. Every piece of work I produce, I treat as guilty until proven innocent. I go looking for the spots where I messed up, because I know they are there. They are always there.

My colleagues sometimes describe me as a flawless worker. That makes me smile, because the secret is the exact opposite. I assume, every single time, that I made a mistake somewhere. Then I go find it before anyone else does. It is not about being afraid of mistakes. It is about accepting that you already made one and going to find it.

And I still make mistakes. A few times a year, something slips through. Honestly, that is reassuring. It proves the system is not based on some illusion of superhuman consistency. It just tilts the odds heavily in favor of catching errors early.

I want to be clear: this is not self-doubt. I do not question whether I can do the work. I question the output. Self-doubt is paralyzing. Systematic doubt is productive. One says "maybe I can't do this." The other says "I probably made a mistake somewhere, let me find it."

## Be wrong, stay right

There is a quiet paradox here. The people who assume they are wrong end up being right most often. They verify. They check. They hunt for the mistake instead of hoping it is not there.

The mindset shift fits in one sentence. Stop asking "did I do this right?" and start asking "where did I mess up?"

Next time you finish a piece of work, resist the urge to move on. Spend five minutes trying to break what you just built. Look for the edge case you did not consider. Re-read the requirement you think you understood. Challenge the assumption you made on autopilot.

That is where the real quality lives. Not in being right. In proving yourself wrong.
