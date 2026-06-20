# Project: FIFA WC 2026 Prediction Tracker

## How We Build

> "We are trying to prove ourselves wrong as quickly as possible, because only in that way can we find progress." — Richard Feynman

**Goal: learn as fast as possible.**

Every step should be small, end with working software, and give us real feedback we couldn't have gotten without building it.

### Principles

- **Vertical slices, not horizontal** — each slice cuts through the full stack (UI → logic → DB) and delivers something a user can actually use. Never build a whole layer (e.g. all the DB models) before touching the next one.
- **Elephant Carpaccio** — slice features into the thinnest vertical slices possible. Each slice is deployable and valuable on its own.
- **Test first** — every build step starts with a failing test. The test defines what "done" means before we write the code.
- **Small steps** — if a step feels big, cut it smaller. A step that takes more than an hour is probably two steps.
- **Feedback over completeness** — a rough thing in front of a real user beats a polished thing that hasn't been tested yet.

- **Continuous Integration** — integrate and run tests frequently, at least daily. Never let branches live long. Feedback from the full system, not just local.
- **Pair/Mob on hard problems** — two sets of eyes catch design mistakes before they're baked in, especially on the first slice of something new.
- **Make it work before you make it right** — don't refactor while in red. Get to green first, then clean up.
- **Observability from the start** — build in logging and visibility early so failures in production tell you what went wrong without needing a debugger.
- **Evolutionary architecture** — design just enough architecture for today's needs. Let the architecture grow and change as we learn more. Avoid big upfront design.

### Before Starting Any Step, Ask:
> "What is the smallest thing I can build that will teach us something we don't already know?"

### References
- Woody Zuill — Mob Programming, "amplify learning"
- Kent Beck — TDD, XP, "make it work, make it right, make it fast"
- Alistair Cockburn — Crystal, "the goal is working software delivered frequently"
- Dan North — BDD, Deliberate Discovery, "introduce just enough structure"
- Dave Farley — Continuous Delivery, "optimize for learning speed"
- Ron Jeffries — XP co-creator, "do the simplest thing that could possibly work"
- GeePaw Hill — TDD practitioner, "many more much smaller steps"
- Jessica Kerr — "learning is the constraint"; systems thinking applied to software teams
- Michael Feathers — working with legacy code, keeping feedback loops tight even in messy codebases
- Rich Hickey — "simplicity is not the same as easy"; design for simplicity over familiarity
