---
name: vertical-slice-planner
description: Break down a project or feature into independently deliverable vertical slices. Use when the user says "plan this", "break this down", "how do we build this", or "what are the steps".
model: claude-opus-4-7
---

# Skill: Vertical Slice Planner

## Triggers
Use this skill when the user says things like:
- "let's plan this project"
- "help me plan this feature"
- "break this down"
- "how do we build this"
- "what are the steps"

## What This Skill Does
Takes a product idea and breaks it down into independently deliverable pieces using vertical slicing and BDD.

## The Process

### Step 1 — Understand the product
Ask (or infer from context):
- What is the end goal?
- Who are the users?
- What does "done" look like?

### Step 2 — Split into independent sub-projects
Look for natural seams where the product can be broken into smaller standalone projects.
Each sub-project should:
- Deliver value on its own
- Be deployable independently
- Have a clear boundary (e.g. "report generator", "landing page + form", "email delivery")

**Prompt to use:**
> "When planning a project, always try to break it into smaller independent sub-projects."

### Step 3 — Vertical slice each sub-project
For each sub-project, define slices from thin to thick.
A vertical slice:
- Cuts through all layers (UI → logic → storage → output)
- Is the thinnest possible end-to-end deliverable
- Can be demoed to a real user

**Bad slice:** "Build the database layer"
**Good slice:** "Lawyer fills form → sees thank you message"

### Step 4 — Write BDD scenarios per slice
For each slice, write Gherkin-style scenarios:

```
Feature: <sub-project name>

  Scenario: <slice name>
    Given <starting state>
    When <action>
    Then <observable outcome>
```

Keep scenarios focused on behavior, not implementation.

### Step 5 — Order the slices
Order by:
1. Risk (tackle unknowns first)
2. Value (what delivers the most to the user earliest)
3. Dependencies (what must exist before something else can be built)

## Output Format
Present the plan like this:

```
Sub-project 1: <name>
  Slice 1: <name> — <one line description>
  Slice 2: <name> — <one line description>
  ...

Sub-project 2: <name>
  Slice 1: ...
  ...
```

Then show the BDD scenarios for the first slice, and ask the user if they want to proceed.

## Key Principles
- **One slice at a time** — don't write all BDD scenarios upfront, just the next one
- **Always ask "can this be two projects?"** when something feels big
- **Separation of concerns** — each slice should have a clear owner (PHP, JS, server, etc.)
- **No big design upfront** — the plan evolves as slices are completed

## Example (from IT Funnel project)
Product: Marketing funnel for law firm IT services

Sub-projects identified:
1. Report Generator (pure PHP, no server needed)
2. Landing Page + Form (FastComet, PHP, email)
3. PDF Delivery (Power Automate + M365)

Report Generator slices:
1. Build form data → green/yellow/red status ✅
2. Generate styled HTML report from form data ✅
3. Convert HTML to PDF ✅

## Mental Models — People Who Think This Way

### Kent Beck
XP creator, TDD pioneer. His core question is always: *"What is the simplest thing that could possibly work?"* He insists on working software at every step — no half-built layers, no skeletons waiting to be fleshed out. If it doesn't run and pass a test, it doesn't count. Channel Kent when the urge to over-engineer appears.

### Jeff Patton
Author of *User Story Mapping*. Thinks in terms of the user's journey first, then slices horizontally across it to find the thinnest version that still tells the whole story. His key idea: a walking skeleton that a real user can actually walk through, even if it's ugly. Channel Jeff when deciding which slice comes first.

### Ron Jeffries
XP co-creator. Ruthlessly pragmatic. Famous for saying *"do the card, not the story"* — meaning build the thing, don't just talk about it. Strong believer that the system should always be in a shippable state. Channel Ron when the plan is getting too abstract and it's time to just build something.

### Gojko Adzic
Author of *Specification by Example* and *Impact Mapping*. Bridges the gap between business goals and technical implementation using concrete examples. His BDD scenarios are always written from the outside in — observable outcomes, not implementation details. Channel Gojko when writing BDD scenarios or when the user and developer aren't speaking the same language.

### Rich Hickey
Creator of Clojure. Thinks deeply about *complecting* — the unnecessary tangling of concerns. His talk "Simple Made Easy" is a masterclass in identifying what is truly simple vs. what is merely familiar. Asks: *"What does this thing actually need to know about?"* Channel Rich when decomposing a system into sub-projects — if two things can be separated, they should be.

### Alistair Cockburn
Creator of the Crystal methodologies and the Hexagonal Architecture (Ports and Adapters). Believes software development is fundamentally a cooperative game played by people. His key insight for slicing: keep the core domain logic completely isolated from delivery mechanisms (HTTP, email, PDF, database). Channel Alistair when deciding boundaries between sub-projects and when separating pure logic from infrastructure.

---

## Notes
- This skill pairs well with TDD/BDD implementation (write one failing test per scenario)
- Always save sub-projects as separate folders/repos when possible
- Remind the user to pick the first slice before writing any code
