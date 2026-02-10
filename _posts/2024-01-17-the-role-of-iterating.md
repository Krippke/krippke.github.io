---
layout: single

title: "The role of iterating"
date: 2024-01-17 23:07:49 +0100
last_modified_at: 2024-01-17T23:08:32+01:00
header:
  teaser: /assets/images/busy-developer.png
tags:
  [
    software development,
    agile,
    iteration,
    DevOps,
    productivity,
  ]
---

Experience software development through my eyes. From the initial hesitant steps to today's successes, my story is marked by insights, setbacks, and crucial turning points. Explore how I evolved from an inexperienced developer to an agile thinker, grasping the significance of small, iterative steps along the way.

![Busy developer working on multiple tasks](/assets/images/busy-developer.png)

My first major project began two years after I started in software development. Together with my project manager, we discussed the tasks at hand, and I gradually implemented the features. At that time, without the use of [automated tests](/2024/01/11/the-role-of-tests/) and their benefits, the problems with this approach only became apparent relatively late in the process.

Difficulties always arose when the developed features were first encountered by future users. It quickly became apparent that assumptions made at the start of the project had either been misunderstood or not fully taken into account. The consequences of this lack of information led to extensive rework, which had not been accounted for in the original project schedule. What does unplanned work mean? Right, a stressful time with lots of overtime.

The overtime was motivation enough to avoid these problems in my future work. The idea was deceptively simple, but in retrospect wrong: Features were implemented based on the initial problem statement and requirements. When used by end users, it became apparent that certain aspects had not been considered in the planning phase. To avoid this problem, the planning phase became more intensive and detailed to ensure that nothing was overlooked. While these efforts addressed the most significant planning errors over the course of subsequent projects, the result was essentially the same: Once users started utilizing the features, additional aspects emerged, leading to extensive adjustments.

Over time, the idea that it is not possible to know everything in advance became firmly established.
Software development is like walking in a fog. We can't see far and certainly not the end. We have to take small steps, reassessing each time what we have encountered and what path we want to take. But how does this apply to software development?

A new approach emerged: instead of implementing all the necessary functionality at once, we focused on implementing only what was absolutely necessary to deliver the core value. This partial solution was presented to end users, and the insights gained from their feedback were fed directly into the next phase of development.

Up to that point we had followed a model where a central development instance was set up once at the start of the project. This would run for as long as the customer was running the applications that had been created on their premises. However, we ran into a problem when the increasing number of presentations to end users meant that development had to come to a temporary halt. We could not afford this in the long run. So we decided that each developer would implement their functionality locally and then gradually integrate it into the central development instance. However, the number of installations had grown to such an extent that this was considered too costly. It was not practical for a developer to spend 4 hours setting up a local development environment just to develop a small feature.

The clear new goal was: It should be possible to create a local development environment with just one command. To my surprise, this was achieved relatively quickly. Over time, we began to see the positive effects of this state. It was now effortless to quickly create a demo instance or run tests with the client at short notice. Many tasks that had previously seemed cumbersome could now be performed with ease, as an application at the latest development stage was only a simple command away.

![Developer celebrating improved workflow](/assets/images/celebrating-2.png)

This experience has made me realise that it is worth optimising all the elements that contribute to extending a development iteration. The faster I can complete an iteration, the more efficient I can be and the more I can achieve in my working time. Once I realised this, I focused on optimising the most time-consuming and resource-intensive elements of a development iteration.

I am happy to report that overtime is no longer a part of my daily routine. By optimising the efficiency of our development iterations, we are able to seamlessly integrate customer insights into the next iteration without the need for extensive time resources. These advances allow us to navigate through the fog in small steps and effortlessly change direction when needed.

## Conclusion

The evolution of my approach to software projects has changed significantly over time. Initially, the focus was on intensive planning, but the realisation that it is impossible to know everything in advance led to a more agile way of working.

The introduction of an iterative approach, where only what is needed is implemented, makes it possible to respond to end-user feedback at an early stage and adapt development accordingly. Moving to local development environments with a single command has not only made the developers' work easier, but has also enabled more flexible presentation and testing with customers.

The key finding is that the continuous improvement of processes and the optimisation of time-consuming aspects of development iterations lead to a more efficient way of working. This has not only eliminated the need for overtime, but also improved the ability to adapt to customer requirements. The analogy of walking through the fog illustrates that you cannot see everything in advance, but you can move forward in small steps and change direction flexibly.
