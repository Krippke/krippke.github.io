---
layout: single

title: "The role of tests"
date: 2024-01-11 11:51:49 +0100
header:
  teaser: /assets/images/struggling-developer.jpg
---

<img src="/assets/images/struggling-developer.jpg">

# The Role of Tests

Welcome to my personal journey of 12 years as a software developer. In this retrospective, I would like to share my development from the beginning until today, with a special focus on the transformative role of automated tests. The term 'test' in the title refers to the very automated tests that have significantly influenced the way I work and the quality of my software. Let's look at the highs and lows of this journey together, how I have overcome challenges and what I have learnt along the way.

I started my journey as a developer 12 years ago. Looking back, my approach to developing code components was pretty disastrous. Based on a verbal description of a function, I started thinking about how I could implement it as a program. After the initial considerations, I started creating the components straight away. As soon as there were no more syntax errors to be found, I compiled the entire software project and started it locally on my PC. I navigated through the user interface to the place where the feature was used and clicked around. If an error occurred, I checked the log files, analysed the stack trace and tried to fix the error. This cycle of building code, compiling software, navigating the UI and troubleshooting was repeated until the feature seemed to work and no more errors occurred.

After a few months of experience in developing and operating our application, I recognised the potential for improvement. Many of the errors were due to a library behaving differently than expected. The idea was to expand our knowledge of the libraries in use in order to reduce false assumptions. I started to study the source code of each library and understand how they work. A few months later, it became clear that the work was paying off. Fewer errors were occurring, and when they did occur, they could be identified and fixed more quickly.

This improvement made another problem more obvious. The level of knowledge in our team was very different. In order to support each other in the projects, every colleague had to know all the assumptions and the behaviour of the libraries used. Long handover meetings were not effective and much of what was discussed was quickly forgotten. The implementation often contained errors that had to be corrected by the responsible colleague during the test phase. The support of a colleague ultimately led to a multiple implementation time. In retrospect, the conclusion was: I wish I had done it all myself. One realisation grew from this experience: We have to assume that people will make mistakes.

My projects always started with a customer problem. If it turned out that the problem could best be solved by software, it landed on my desk with a supposedly ready-made solution. Sentences like "Do it this way and that way and we'll have solved the problem" reassured me at first. The consultant knew exactly what was needed. Over the years, however, I started to break out in a cold sweat whenever I heard something like that. Why, you ask? I'll try to illustrate this with the following example:

The customer has an appointment with our consultant. During this one-hour appointment, the customer explains their problem. The consultant has a proposal that sounds like it could solve the problem. A few days later, I have a meeting with the consultant in which the basic aspects of the required software are explained to me. Based on this information, I start with the development. Over the next three months, I have short meetings with the consultant from time to time to check on progress. Always with the same result: it's going in the right direction, keep going. The day comes when all the required functions have been implemented and manually tested. The software works. The solution is presented to the customer. After two minutes, the customer says: "That's not at all what I need.

This extreme example is supposed to show the following: At the end of the project, the software will not be what was intended at the start of the project. The extent of this deviation can be influenced. However, this is not part of this article. The software must be able to change. Changes will come and are the norm.

It is precisely this changeability that cannot be mapped with my original type of software development. With every change, I would have to know what impact it would have on the other components of the software. As humans are quite forgetful, mistakes will happen sooner or later. To be on the safe side here, all aspects of the software would have to be tested again manually. This requires the corresponding behaviour to be documented and descriptions of which behaviour is to be tested and how. Not to mention the time and effort that would be involved in all this work.

Over the years, I have repeatedly read about different types of automated tests. Unit tests, integration tests, end-to-end tests were theoretical concepts for me and nothing that I came into contact with in my daily work. I had tried from time to time to create automated tests for my components. However, it always failed because I didn't know how to create tests in our software. Looking back, I can now say that the obstacle to unit tests was our software architecture. No boundaries were defined, components were overlaid with responsibilities. Almost all components of the entire software had to be initialised for a unit test. We'll save the topic of software architecture for another post.

<img src="/assets/images/celebrating.jpg">

Almost 8 years after I started developing software, I was now able to write tests. The positive effects quickly became apparent. After 8 years without tests, you have gained some experience and appreciate the benefits of automated tests:

- **Tests are the definition of behaviour:**
  When I create a component, I assign certain behaviours to it. For each expected behaviour, I write a test to ensure that the component does what I expect it to do. In this way, I record my thoughts at the time of creating the component in the form of the tests. Questions like "What was the task of this component again?" no longer arise. I can look at the tests and see what the component is supposed to do.
- **Tests lead to a better API:**
  When I created components back then, it often happened that when I used these components later, I realised that the API was difficult to use. Since I started writing tests, I realise during the creation of the component whether the API is easy to use or not. I am motivated to make the API user-friendly because I am forced to use it myself to create my tests.
- **Tests as a guide for adjustments:**
  When modifying existing software, the developer does not necessarily need comprehensive knowledge of how the software works in detail. The definitions that determine the behaviour of the components are comprehensively documented by tests. In the event of a modification that violates an original assumption, the failing test specifically points out the problem to the developer.The developer gets confidence that he is not breaking anything.
- **Tests uncover conceptual problems early on:**
  Software development is a binary field - it either works or it doesn't. In the process of realising concepts and ideas that are the product of human thought, conceptual hurdles become apparent at an early stage. Identifying these problems early on significantly reduces the time required for implementation. Writing tests plays a crucial role in evaluating the smooth interaction of the components.
- **Tests help with scaling:**
  Software without tests assumes that every developer involved is familiar with the software in detail. This causes a developer to spend a lot of time making meaningful code contributions. Software with tests allows less experienced developers to contribute, as the required behaviour is ensured by tests. The existence of tests enables me to define work packages and hand them over to colleagues with little time required. The colleague's work results can be quickly evaluated through his tests. Adjustments can be made with minimal effort if necessary.
- **Tests lead to a better software architecture:**
  Writing tests for software with a poor architecture is very time-consuming. If I change a component and am then forced to adapt hundreds or thousands of tests, my motivation to change something will increase. If you find it difficult to create a test for a component, you will think about how to do it better. This often leads to responsibilities becoming clearer. Tests for software with a good architecture can be created quickly and easily.
- **Tests are the basis for agile working:**
  Software requirements are constantly changing. Automated tests help with adaptation, bug fixing or expansion. Software consists of thousands of components. Responsibilities are assigned to each component. Without automated tests, manual tests are the consequence. In practice, however, this is not feasible.
- **Tests help to understand the behaviour of a library or framework:**
  When I use a component from a library today, I write a few tests to check my assumptions. If it turns out that my knowledge of the component is insufficient and my assumptions are wrong, the test fails. This gives me the opportunity to adjust my assumptions by reading the documentation or the source code. As soon as the test runs successfully, I can assume that I have built up a sufficiently correct understanding. There is a further advantage for the life cycle of the library in the software. If the library behaves differently in a newer version than it originally did, a test will fail and I as the developer have the opportunity to deal with it. This gives me a sense of security, which helps me to keep the versions of the libraries I use up to date.

## Conclusion

To summarise, I can say that automated tests have not only led to higher code quality, but also to a more sustainable and efficient way of developing software. The insights gained have revolutionised my approach to projects and contribute significantly to my understanding of good software architecture. The decision to establish testing as an integral part of my development process proved to be the key to successful and future-orientated software development.
