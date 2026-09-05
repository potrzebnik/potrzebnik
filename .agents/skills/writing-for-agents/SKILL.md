---
name: writing-for-agents
description: How to write any document an agent consumes here — a skill, an agent definition, CLAUDE.md, or a docs page reached by a pointer. Context pointers, the two budgets a document spends, the information ladder, completion criteria, leading words, and how to trim sediment. Read this before adding or editing one of those documents; `audit-docs` leans on it.
---

# Writing for agents

Adapted from `mattpocock/skills` (`writing-for-agents`). The packaging differs between a skill, an
agent definition and `CLAUDE.md`; the writing does not. The same levers make each of them
predictable — the agent takes the same _process_ every run, rather than producing the same output.

## Context pointers

A **context pointer** is a reference held in the agent's context that names material outside it and
encodes the condition for reaching that material. A skill's `description` is one. A line in
`CLAUDE.md` naming a docs page is the same object. The _wording_ of the pointer, not its target,
decides when the agent reaches for the material, and how reliably. Key material behind a weak
pointer is a variance bug: sharpen the wording first, and inline the material only if sharpening is
not enough.

A pointer does two things: it says what the material is, and it names the branches that should
trigger reaching for it. Every word of an always-loaded pointer costs on every turn, so it deserves
harder trimming than the body:

- **Lead with the trigger word.** The pointer does its triggering work where it starts.
- **One trigger per branch.** Synonyms renaming the same branch are one branch written twice.
- **Cut identity the body already carries.**

**A pointer's target must be a maintained document, never a record of how a decision was made.** A
pointer at `CLAUDE.md`, at a config file, at a page that describes current state is fine: somebody
owns it. A pointer at a planning document frozen at the moment it was written rots twice, once
through content that stops being true and once through section numbers that shift under the
citation. Citing by section number is a warning sign in itself.

The failure is worse than a dead path: such a pointer leads to _stale_ content before it leads to
missing content, and the agent reads it as fact. If a rule from that kind of document is live, write
it inline, in a sentence or two, where it applies.

## The two budgets

- **Context load** — what always-loaded material costs the agent's window. A line in `CLAUDE.md`, a
  skill `description`, anything present on every turn costs tokens and attention whether or not it
  fires.
- **Cognitive load** — what it costs the human: knowing which documents exist and when to reach for
  which. This is not a cost to minimise. It is the price of human agency; spend it where human
  judgement matters, remove it where it does not.

Material reached only through a pointer avoids context load at the price of the pointer's own line.

## The information ladder

A document is built from **steps** (ordered actions) and **reference** (definitions, rules and facts
consulted on demand), mixed freely. The decision that matters is where each piece sits on the ladder,
ranked by how immediately the agent needs it:

1. **Step in the file** — what the agent does, in order.
2. **Reference in the file** — consulted on demand. Often a legitimately flat set of peers; that is
   a sensible shape, not a smell.
3. **Distributed reference** — pushed to a separate file behind a pointer, loaded only when the
   pointer fires.

Push too little and the top level bloats; push too much and material the agent actually needs is
hidden. That tension is the whole decision. **Progressive disclosure** is the move down the ladder,
and it protects the hierarchy rather than merely saving tokens. Branching is the cleanest test:
inline what _every_ branch needs, push behind a pointer what only _some_ branches reach.

**Colocation** is the companion within one file. The ladder decides how deep a piece sits;
colocation decides what sits beside it once it is there. Keep a term's definition, its rules and its
caveats under one heading, so reading one part brings its neighbours.

**Sprawl** is the failure mode here: a document simply too long, even when every line is live and
unique. Attention dilutes across the excess, and each extra line is one more to keep relevant.

## Steps and completion criteria

Every step ends in a **completion criterion** — the condition that tells the agent the work is done.
Two properties make it a lever:

- **Clarity** — can the agent tell done from not-done? A vague boundary invites finishing early,
  with attention sliding onto being finished rather than onto the work. Sharpen the boundary first;
  it is local and cheap.
- **Demand** — how much it asks for. "Every modified model accounted for" forces thorough work where
  "produce a list of changes" does not. Demand drives the legwork an agent does inside a task,
  carried by the wording rather than written as its own step. It binds a flat reference set the same
  way: "every rule applied" carries an exhaustiveness bar without any sequence at all.

The strongest criteria are both checkable and exhaustive.

## Leading words

A **leading word** is a compact concept already living in the model's pretraining, which the agent
thinks with while the document runs (_lesson_, _fog of war_, _tracer bullets_). Repeated as a token
and never as a sentence, it accumulates a distributed definition and anchors a whole region of
behaviour in the fewest tokens, recruiting priors the model already has. Coining your own word works
if you define it clearly, but a coined word recruits no priors: you pay in definition tokens what a
pretrained word gives for free. Reach for the existing word first.

Look for refactors. A triad spelled out in three places, or a pointer spending a sentence gesturing
at one idea, is a fragment begging to collapse into a single token.

**Negation** is the failure mode next door. Steering by prohibition pulls the forbidden behaviour
into context and makes it _more_ available, not less. Prompt positively: state the target behaviour,
so the forbidden one is never uttered. A prohibition earns its place only as a hard barrier that
cannot be phrased positively, and even then pair it with the positive goal.

## Trimming

- Keep every meaning in **one source of truth**, so changing behaviour is a single edit. Duplication
  costs maintenance and tokens, and inflates a meaning's rank on the ladder above its real standing.
- **The environment is a source of truth too** — `package.json` scripts, config files, directory
  layout, `--help` output — and a document repeating it is a **cache**: a copy of a lookup, worth its
  cost only when the lookup is expensive. Cache what the agent will not find by looking: an unwritten
  convention, the reason behind a decision, a gotcha no config confesses. Leave one-file, one-command
  lookups to the environment, where they cannot go stale.

  In this repository an ESLint rule's `messages` are part of that environment. A rule that already
  explains itself when it fires does not need the same explanation restated in `docs/`.

- Check each line for **relevance**: does it still bear on what the document does? Without trimming
  discipline the default outcome is **sediment** — stale layers that settle because adding feels safe
  and removing feels risky, until somebody has to dig through them to find what is still live. That
  is what `audit-docs` exists to catch.
- Hunt **no-ops** sentence by sentence: an instruction the model already follows by default pays a
  cost to say nothing. The test — does it change behaviour against the default? — is relative to the
  model, not to the reader. Two people who disagree about whether something is a no-op disagree about
  the default, and settle it by running the document, not by arguing. When a sentence fails this
  test, cut the whole sentence rather than trimming words out of it.
