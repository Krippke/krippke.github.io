---
layout: single
title: "Why I never tell AI what to do"
date: 2026-04-26 09:00:00 +0100
last_modified_at: 2026-04-26T09:00:00+01:00
author: "Manuel Holzrichter"
header:
  teaser: /assets/images/never-tell-ai.jpg
tags: [ai, productivity, mindset, software-development, collaboration]
---

A few weeks ago, I had a problem I thought I understood. I had a solution in my head, clean and complete. I sat down, opened the AI, and described the task in careful detail. Inputs, outputs, structure, edge cases. I asked it to implement what I had described. A minute later I had a confident, well-structured answer back. Names were good. Tests were there. The shape looked right.

I started reading. Halfway through I noticed something off. A small assumption the AI had made, perfectly reasonable, that quietly contradicted a constraint I had never written down. The constraint was obvious to me. It was not obvious to anyone else, and I had not put it on the page. I tried to patch the result. The patch broke the next thing. By the end of the afternoon I had thrown most of it away and started over.

The output was not the problem. The problem was that I had told the AI what to do before checking that we agreed on what the problem was. I had skipped the part where I find out whether the other side of the conversation actually understands the situation. That afternoon, I changed how I work with AI. I stopped giving instructions. I started asking questions.

## The flip

The change is small in the moment and large over a week of work. Instead of opening with "do X," I open by describing the problem and asking the AI what approaches it would consider. I read the answer. I push back where my context says push back. I ask follow-up questions about the parts I do not yet trust. Only once we agree on direction do I let it commit to anything substantial.

The first few minutes look slower. The afternoon looks faster. The week looks much faster. Same task, same tool, different first move.

## The two assumptions

The method only works if you hold two things in your head at the same time, and most people drop one of them.

The first: **the AI knows more than me.** Across the breadth of software engineering, it has read more code, seen more patterns, and been exposed to more trade-offs than I will encounter in my career. On any topic where I have not spent serious time, its judgement is probably broader than mine.

The second: **I know more about my context than the AI ever will.** The constraints I have not written down. The team agreements that live in old chat threads. The legacy decisions that look weird until you know who made them and why. The customer who reacts badly to one specific phrase. None of this is in the model's training data, and none of it gets in until I put it there.

Both are almost always true at the same time, and they pull in different directions. Treating the AI as a search engine wastes the first one. Treating it as an oracle ignores the second. The working pattern I have settled on is built to honor both. I lean on the AI for what it knows. I do not lean on it for what only I know.

## Questions reveal understanding; instructions assume it

The cleanest analogy I have for this is working with a trainee. When I want to know what a trainee has actually understood, I do not hand them an instruction and watch the result. By the time the result is in front of me, the signal is muddy. Did they get it right because they understood, or because the instruction was tight enough that any careful person would have produced the same thing? Did they get it wrong because they misunderstood the task, or because they misunderstood one specific word I used?

So I ask questions instead. From different angles. "How would you approach this?" "What would you watch out for?" "Where do you see the risk?" Their answers tell me, very quickly, where the gap is and what context I need to share before they start.

With an AI it is the same move, but the asymmetry runs the other way. I am not testing whether the AI knows the field. I am testing whether its understanding of _my situation_ is good enough that I can safely lean on its broader knowledge. Questions are how I find out. Instructions skip that step and hope for the best. Hope is not a working method.

## Direction before detail

The most expensive mistake I make with AI is not a wrong answer. It is reviewing a detailed answer while the direction is still open.

When the direction is settled, detail review is fast. You know what you are looking for. You know what should be there and what should not be. The eye lands on the wrong things quickly because the right things have a clear shape.

When the direction is still open, detail review is a trap. Important shaping decisions hide inside what looks like noise. A default value, a phrasing, a chosen abstraction, a quietly skipped concern. Each one is small enough to slide past a reviewer who is busy parsing whether the surface looks correct. And once one of them slides past, everything downstream is built on top of it. By the time the misread surfaces, you are not fixing a line. You are throwing the result away.

So I do not let the AI go deep until the direction is locked. I shape the high-level concept with questions. I check that the AI is heading where I want it to head. I correct early, when correcting is cheap and the result is still small. Only then do I fire it up. Detail review after a direction lock is a different activity from detail review before one. The first is verification. The second is archaeology.

## Bad output is a mirror

The hardest habit to retrain was my reaction to bad AI output. My first instinct used to be frustration with the model. The output was wrong, the AI was the one that produced it, the source of the problem felt obvious.

It was almost never the source of the problem.

When the AI produces something visibly off, the cause is rarely a capability gap. Far more often, it is a context gap on my side. I described the situation badly because I had not understood it well enough myself. The unwritten constraint stayed unwritten. The trade-off I had quietly resolved in my head never made it into the prompt. The AI made a reasonable guess where I had left a hole, and the guess was wrong because the hole was where the most important information should have been.

Now I treat bad AI output as a diagnostic. If I cannot get a useful answer out of the AI, I almost certainly cannot produce a clean answer myself. The exercise of describing the problem well enough that the AI can engage with it is the same exercise as understanding the problem well enough to solve it. When that exercise fails, the failure is information. It tells me where to go think.

## Stop telling. Start asking.

The pattern fits in one sentence. Stop telling the AI what to do. Start asking what it would do.

What changes is not the AI. The AI is the same on both sides of the change. What changes is which of your two advantages you are using. Instructions lean on your context and waste the AI's knowledge. Questions lean on the AI's knowledge and force you to be honest about your context. The output gets better. And, quietly, so does your own thinking - because you cannot ask a good question about a problem you do not understand.

Next time you sit down to use AI for real work, resist the urge to instruct. Describe the problem. Ask what it would do. Read the answer like you would read a colleague's first sketch. Push back where your context says push back. Agree on direction before you agree on detail.

Then, only then, let it loose.
