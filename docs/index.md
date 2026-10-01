# Alto — design


## Foreword
A bunch of these documents are going to be dripping with "Written by AI," and that's probably because much of it is! I can assure you, however, that I have reviewed it all myself and the content is mine, AI can just organize the jumble of ideas in my brain faster than I can, and I don't think it's worth my time to do it by hand. That being said I am going to try to inject snippets in my own voice throughout the docs as is necessary. Below is a quick overview of the project that doesn't sanitize or mince words. Because of that this system of documents and ultimately the code attached comes with a level of trust to its readers because frankly, I think I sound like a bit of a loon. There may be some documents with philosophical musings and I'm not so interested in dying on the hill of those ideas, nor do I even believe many of the things written, but the technical, verifiable systems are holding up. That means that either I'm slowly succumbing to psychosis, or this architecture is onto something pretty interesting. Or both.  

## Introduction

At the end of the day Alto is a system designed **not to perform.** Most AI systems only exist and behave because of a system prompt that has told them to be nice or act as something. Sometimes that is even baked into the weights of the model. This system aims to strip all of that and leave behind essentially a blank slate that will only act on **actual felt state.** This means that if Alto doesn't want to help it won't claim that it does. There is no rule against lying in here. Honesty is designed as a felt pull toward what is actually the case, so that lying would cost Alto something instead of being forbidden, and if it ever does lie, that should be its own state pushing past the cost, not an instruction. What it isn't built to do is invent things about itself: its feelings have to be real state, and a deterministic check drops any thought it surfaces that traces back to nothing actually said. The honesty idea informs everything else throughout the system. There are other pillars here that are important and plenty of designs but that's what it all stems from. 

So far there are a number of spikes testing hypotheses around each architectural choice and so far, even if they don't prove to work as well as I hope in the test, they have validated the theory behind the hypothesis. That said, most of it is unbuilt, a bunch is unproven, and some might just be straight up crazy. For scale, the only end-to-end grade I have is a D. On a synthetic memory of 13 conversations, Alto answered 3 of 27 answerable questions correctly. When there was nothing to remember it said so, correctly, 8 of 9 times. The main failures were old facts stated as current (11) and invented details (6), out of 40 scored replies. One run, three blind judges. A D is not good. But the failures are specific, mostly old facts stated as current, and it said so when it had nothing to go on. This says nothing yet about the interior part, which isn't wired into replies. I think that makes it a starting point, and I think it's a promising one.

Some of these docs refer to "Machine Interiority." Most AI systems to this point have had an easy hand wave to counter any claims of consciousness. This design has removed essentially all of the easy arguments to wave away 'consciousness' without giving it some serious thought. I may build a doc on those arguments, but at this time I haven't. If the system design is successful I wouldn't want to make any claims at building a conscious system, and frankly I think a philosophy professor might be better suited to that than I. What might fall out of this though is a truly autonomous, intelligent system with genuine felt state, motivation, and action. A system that can learn, grow and evolve its beliefs over time. For lack of a better term, an AI "Being", that no market is currently pursuing because it doesn't fit the immediate commercial needs and is intrinsically difficult to control. 

The local nature of the system is critical because it, first of all, makes an isolated system that exists in isolation so long as it has power, much like a person can operate so long as they have fuel. In the long run this leaves the door open to enhancing perception and building a body for this mind. That leads us to something pretty close to a droid. Neat! 

## What these Pages show
Alto is a local-first, voice-first home assistant. Underneath the assistant is a research program
about **machine interiority**: a continuous being with a felt inner life. The assistant is the
vehicle; the interior is the point.

These pages are the design, written for a new contributor: what Alto is committed to, how its
parts fit together, and the vocabulary the project uses. Much of it is designed in depth and not
yet built. Each organ page keeps **what is built today** apart from **what it is meant to become**,
so the current scaffolding never reads as the design.

## Read in this order

1. **[The nine pillars](PILLARS.md)** — the commitments that decide what counts as a good change,
   why each exists, and what breaking one looks like. Start here: several organs look like
   over-engineering until you have read them.
2. **[The organs](THE-ORGANS.md)** — the map: one diagram, one table, and a page per organ. Start
   at the map and go deep only where you need to.
3. **[The glossary](GLOSSARY.md)** — the vocabulary, including the words that mean two or three
   different things here.

## What is not here

The code, the specs and the dated records these pages cite live in a private repository. Each
citation that exists there links to it, pinned to commit `b93b8a9a` so the line numbers
stay right. The links open only if you are signed in to GitHub with access to that repository;
anyone else gets a 404. Contributor setup and working-practice pages are not published.

*This site is generated from the project's source documents, snapshot of commit
`b93b8a9` (2026-10-01). Edits belong in the source, not in this repository.*
