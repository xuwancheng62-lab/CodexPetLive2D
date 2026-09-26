# Codex Live2D Pet

> A lightweight desktop Live2D companion whose animations and
> expressions react to Codex activity.

## 1. Project Overview

Codex Live2D Pet is a small open-source desktop companion project.

The core idea is simple:

**Codex state → state adapter → pet state machine → Live2D
animation/expression**

Instead of using a fixed sprite-sheet pet, the application renders a
user-provided Live2D model in a transparent desktop window. When Codex
is working, waiting for input, idle, completed, or encounters an error,
the character reacts accordingly.

The project should remain model-agnostic: users import their own
compatible Live2D model rather than the repository bundling copyrighted
Workshop or commercial character assets.

### Primary goal

Build a working macOS prototype that:

-   displays a Live2D model in a transparent always-on-top desktop
    window;
-   lets the user drag/reposition the pet;
-   supports basic Live2D idle animation;
-   detects or receives Codex activity state;
-   maps Codex states to character reactions;
-   allows users to import their own Live2D model.

### Non-goals for v1

Do **not** initially build:

-   an LLM chatbot inside the pet;
-   voice conversation;
-   complex memory/personality systems;
-   a model marketplace;
-   Windows/Linux support;
-   automatic extraction of Wallpaper Engine assets;
-   cloud services or accounts;
-   elaborate settings pages.

The first milestone is a reliable desktop pet, not a full
virtual-character platform.

------------------------------------------------------------------------

# 2. Product Experience

The pet lives on the desktop while the user works with Codex.

Example behavior:

  Codex state         Pet behavior
  ------------------- -----------------------------------------
  Idle                breathing, blinking, subtle movement
  Working             focused/work animation
  Waiting for input   looks toward user / question expression
  Completed           happy expression / short celebration
  Error or blocked    confused or frustrated expression

The mapping should be configurable because different Live2D models
expose different motions and expressions.

------------------------------------------------------------------------

# 3. Proposed Architecture

``` text
Codex
  │
  ▼
Codex State Adapter
  │
  ▼
Normalized State
(IDLE / WORKING / WAITING / DONE / ERROR)
  │
  ▼
Pet State Machine
  │
  ├── motion mapping
  ├── expression mapping
  └── transition rules
  │
  ▼
Live2D Renderer
  │
  ▼
Transparent Desktop Window
```

## Main modules

### Desktop Shell

Recommended starting point: **Electron + TypeScript**.

Responsibilities:

-   transparent frameless window;
-   always-on-top behavior;
-   drag/reposition;
-   click interaction;
-   app lifecycle;
-   later: packaging.

Tauri can be reconsidered later if binary size or resource usage becomes
important. Do not optimize this before the prototype works.

### Live2D Renderer

Responsibilities:

-   load a user-selected `model3.json`;
-   load textures and motions;
-   render with transparent background;
-   run idle motion;
-   trigger expressions/motions by name;
-   optionally track the mouse with eyes/head.

Keep the renderer independent from Codex integration.

### Codex State Adapter

This is the most experimental component.

Its responsibility is to convert whatever reliable Codex signals are
available into a small normalized state interface:

``` ts
type CodexState =
  | "idle"
  | "working"
  | "waiting"
  | "done"
  | "error";
```

The rest of the application must **not** depend directly on Codex
internals.

If Codex integration changes later, only this adapter should need
replacement.

### Pet State Machine

Responsibilities:

-   receive normalized Codex states;
-   decide when a state transition occurs;
-   prevent animation spam;
-   trigger the configured Live2D motion/expression;
-   return to idle after one-shot animations.

### Model Configuration

Because Live2D models use different motion/expression names, maintain a
per-model mapping.

Example:

``` json
{
  "idle": {
    "motion": "Idle"
  },
  "working": {
    "motion": "Work",
    "expression": "Focused"
  },
  "waiting": {
    "motion": "Question",
    "expression": "Curious"
  },
  "done": {
    "motion": "Happy",
    "expression": "Smile"
  },
  "error": {
    "motion": "Confused"
  }
}
```

If a requested motion does not exist, gracefully fall back to idle.

------------------------------------------------------------------------

# 4. Suggested Repository Structure

``` text
codex-live2d-pet/
├── README.md
├── PROJECT.md
├── package.json
├── src/
│   ├── main/
│   │   ├── main.ts
│   │   └── window.ts
│   │
│   ├── renderer/
│   │   ├── live2d/
│   │   │   ├── loader.ts
│   │   │   ├── renderer.ts
│   │   │   └── motion-controller.ts
│   │   └── app.ts
│   │
│   ├── codex/
│   │   ├── adapter.ts
│   │   ├── state.ts
│   │   └── mock-adapter.ts
│   │
│   ├── pet/
│   │   ├── state-machine.ts
│   │   └── mapping.ts
│   │
│   └── config/
│       └── model-config.ts
│
├── models/
│   └── .gitkeep
│
├── docs/
│   ├── architecture.md
│   └── model-import.md
│
└── tests/
```

`models/` must not contain third-party copyrighted models in the public
repository.

------------------------------------------------------------------------

# 5. Execution Plan

## Stage 0 --- Repository and constraints

**Goal:** establish a clean project before implementing features.

Tasks:

-   initialize Git repository;
-   create Electron + TypeScript project;
-   configure linting/formatting;
-   create the proposed folder structure;
-   add `.gitignore`;
-   add a model licensing warning;
-   commit the initial skeleton.

**Done when:**

``` bash
npm install
npm run dev
```

opens a basic application window without errors.

Estimated effort: **30--60 min**

------------------------------------------------------------------------

## Stage 1 --- Transparent desktop pet window

**Goal:** prove the desktop-shell experience first.

Tasks:

-   create frameless transparent window;
-   remove normal window chrome;
-   keep the window above ordinary applications;
-   support drag-to-move;
-   preserve window position;
-   ensure transparent areas render correctly.

Initially render a simple placeholder shape/image.

**Done when:**

A placeholder character can sit on the macOS desktop, be dragged around,
and remain visually transparent around the character.

Estimated effort: **1--2 h**

------------------------------------------------------------------------

## Stage 2 --- Live2D model rendering

**Goal:** replace the placeholder with a real Live2D model.

Tasks:

-   integrate a compatible Live2D web renderer/runtime;
-   load `model3.json`;
-   resolve textures;
-   load motions and expressions;
-   play idle motion;
-   handle model-load errors cleanly.

Use a legally distributable sample model during development.

**Done when:**

Running the app displays an animated Live2D character in the transparent
window.

Estimated effort: **2--4 h**

------------------------------------------------------------------------

## Stage 3 --- Model import

**Goal:** allow the app to work with models other than the development
sample.

Tasks:

-   add model-folder/file selection;
-   locate `model3.json`;
-   validate required resources;
-   remember the selected model;
-   display useful errors when a model is incompatible;
-   document the supported model structure.

**Done when:**

The user can select a compatible Live2D model and restart the
application without manually editing source code.

Estimated effort: **1--3 h**

------------------------------------------------------------------------

## Stage 4 --- Pet state machine

**Goal:** separate character behavior from Codex integration.

Implement:

``` text
idle
working
waiting
done
error
```

Create a **mock Codex adapter** first.

Example development controls:

``` text
1 → idle
2 → working
3 → waiting
4 → done
5 → error
```

Tasks:

-   implement state transitions;
-   map states to model motions/expressions;
-   add fallback behavior;
-   prevent repeated state events from restarting the same animation;
-   return one-shot states such as `done` to idle.

**Done when:**

All five states can be triggered manually and produce distinct reactions
without any Codex integration.

Estimated effort: **1--2 h**

------------------------------------------------------------------------

## Stage 5 --- Codex integration spike

**Goal:** determine the most reliable way to obtain useful Codex
activity signals.

This stage is deliberately isolated because Codex integration is the
project's main technical uncertainty.

Investigate, in order:

1.  documented/local integration surfaces;
2.  process/event information that can be consumed reliably;
3.  logs or structured events if legitimately exposed;
4.  explicit wrapper/hook integration if direct observation is
    unreliable.

Do **not** tightly couple the renderer to undocumented implementation
details.

Record findings in:

``` text
docs/codex-integration.md
```

The document should contain:

-   available signals;
-   reliability;
-   latency;
-   platform limitations;
-   chosen implementation;
-   fallback strategy.

**Done when:**

The app can reliably distinguish at least:

``` text
idle
working
```

and preferably:

``` text
waiting
done
error
```

from real Codex activity.

Estimated effort: **2--6 h**, depending on available integration
surfaces.

------------------------------------------------------------------------

## Stage 6 --- Connect Codex to the pet

**Goal:** complete the first real product loop.

Connect:

``` text
Codex adapter
      ↓
state machine
      ↓
Live2D motion/expression
```

Add:

-   transition debounce;
-   sensible delays;
-   fallback to idle;
-   error recovery.

**Done when:**

The user starts a Codex task and the pet automatically reacts without
manual keyboard triggers.

This is the **MVP milestone**.

Estimated effort: **1--2 h**

------------------------------------------------------------------------

## Stage 7 --- Interaction polish

Only begin after the MVP works.

Potential features:

-   eyes/head follow cursor;
-   click reaction;
-   petting reaction;
-   drag behavior;
-   random idle motions;
-   sleep after prolonged inactivity;
-   small speech bubble for state messages;
-   adjustable size;
-   launch at login.

Do these one at a time.

Estimated effort: **half day to several days**, depending on scope.

------------------------------------------------------------------------

## Stage 8 --- Packaging and open source release

Tasks:

-   build a macOS package;
-   write installation instructions;
-   write model-import instructions;
-   add screenshots/GIF;
-   document privacy behavior;
-   add license;
-   verify no copyrighted Live2D/Wallpaper Engine assets are committed;
-   create GitHub release.

**Done when:**

Another person can clone/install the project, import their own model,
connect it to Codex, and use it without modifying source code.

------------------------------------------------------------------------

# 6. MVP Definition

Do not call the project MVP-complete until all of these work:

-   [ ] transparent desktop window
-   [ ] draggable pet
-   [ ] Live2D model loads
-   [ ] idle animation works
-   [ ] model can be changed without source-code edits
-   [ ] five normalized pet states exist
-   [ ] mock state switching works
-   [ ] at least `idle` and `working` are driven by real Codex activity
-   [ ] state → animation mapping is configurable
-   [ ] application survives missing motions/resources
-   [ ] README explains installation and model import

------------------------------------------------------------------------

# 7. Development Rules for Coding Agents

When Codex or another coding agent works on this repository:

1.  Read `PROJECT.md` before making architectural changes.
2.  Work on **one stage at a time**.
3.  Do not implement later-stage features unless required by the current
    stage.
4.  Keep Codex-specific logic inside `src/codex/`.
5.  Keep Live2D rendering independent from Codex.
6.  Do not hard-code motion names into application logic.
7.  Do not commit third-party character/model assets without an explicit
    redistribution license.
8.  Prefer the smallest implementation that satisfies the current
    stage's acceptance criteria.
9.  After each stage:
    -   run the app;
    -   run relevant tests;
    -   update documentation if architecture changed;
    -   make a clean commit.
10. If an assumption about Codex integration is uncertain, investigate
    and document it before restructuring the application around it.

------------------------------------------------------------------------

# 8. Recommended Build Order

``` text
Desktop Window
      ↓
Live2D Rendering
      ↓
Model Import
      ↓
Mock State Machine
      ↓
Codex Integration Research
      ↓
Real Codex State Mapping
      ↓
Interaction Polish
      ↓
Packaging
```

The important principle is:

> **Make the pet work without Codex before making Codex control the
> pet.**

This prevents the uncertain integration layer from blocking the rest of
the project.

------------------------------------------------------------------------

# 9. Time Budget

A reasonable prototype target:

  Work                   Approximate time
  -------------------- ------------------
  project setup                  0.5--1 h
  transparent window               1--2 h
  Live2D rendering                 2--4 h
  model import                     1--3 h
  state machine                    1--2 h
  Codex integration                2--6 h
  integration/polish               1--3 h

**Basic MVP:** roughly **8--15 hours**.

A rough but visible demo could likely be produced in **one afternoon**
if a compatible Live2D sample model is already available.

------------------------------------------------------------------------

# 10. Future Ideas

These are deliberately outside the MVP:

-   multiple characters;
-   per-project pets;
-   Codex task-progress reactions;
-   Git/GitHub events;
-   terminal-command reactions;
-   sound effects;
-   voice/TTS;
-   speech bubbles containing short Codex status summaries;
-   user-created behavior packs;
-   model configuration UI;
-   Windows/Linux;
-   plugin system;
-   optional local LLM personality.

Keep these in the backlog rather than implementing them during the
initial build.

------------------------------------------------------------------------

# 11. First Session Checklist

For the first coding session, stop after Stage 2 if necessary.

``` text
[ ] Create repository
[ ] Bootstrap Electron + TypeScript
[ ] Create transparent frameless window
[ ] Make window draggable
[ ] Render placeholder
[ ] Integrate Live2D renderer
[ ] Load legal sample model
[ ] Confirm idle animation
[ ] Commit: "feat: bootstrap Live2D desktop pet"
```

At that point the project already has a visible result. Codex
integration comes afterward.
