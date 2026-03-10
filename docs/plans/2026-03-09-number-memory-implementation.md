# Number Memory Training Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new number memory training mode with custom starting length, per-user history, and a leaderboard ranked by the longest successful remembered length.

**Architecture:** Keep the single-page app and add a mode switch that toggles between Schulte table and number memory UIs. Extend `script.js` with a second game-state branch, separate Bmob record/best-score classes for number memory, and mode-aware rendering so the existing Schulte features continue to work unchanged.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Bmob REST API, Node test runner

---

### Task 1: Add failing tests for number memory helpers

**Files:**
- Modify: `大脑训练/script.test.js`
- Test: `大脑训练/script.test.js`

**Step 1: Write the failing test**

Add tests for helper behavior covering:

- start-length normalization and bounds
- default start length using previous best plus one
- sequence generation of the required length
- score summary ranked by longest successful length descending

**Step 2: Run test to verify it fails**

Run: `node --test script.test.js`
Expected: FAIL because the number memory helpers do not exist yet.

**Step 3: Write minimal implementation**

Add the new pure helper functions in `大脑训练/script.js` and export them.

**Step 4: Run test to verify it passes**

Run: `node --test script.test.js`
Expected: PASS for the new helper tests.

### Task 2: Add number memory mode markup

**Files:**
- Modify: `大脑训练/index.html`

**Step 1: Add mode switch UI**

Add clear mode buttons or tabs for `舒尔特表` and `数字记忆`.

**Step 2: Add number memory panel**

Add:

- start length input
- start button
- current length display
- sequence display area
- answer input
- submit button
- result text
- records and leaderboard containers for number memory

### Task 3: Add number memory styles

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Style mode switch**

Make mode switching consistent with the current visual system.

**Step 2: Style number memory panel**

Add styles for the sequence display, answer input, status messaging, and new records/leaderboard cards.

### Task 4: Add number memory Bmob helpers

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add constants**

Add `NumberMemoryRecord` and `NumberMemoryBest` class names.

**Step 2: Add payload and query helpers**

Implement helpers to:

- create number memory run records
- fetch personal number memory history
- fetch personal number memory best row
- upsert best row by `bestSuccessLength`
- fetch leaderboard rows ordered by best length descending

### Task 5: Implement number memory gameplay

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add mode-aware state**

Track the active training mode and separate number memory round state from Schulte state.

**Step 2: Add round flow**

Implement:

- start with custom/default length
- show generated digit sequence
- hide it after a delay
- accept user input
- advance length on success
- end the run on failure

### Task 6: Render number memory records and leaderboard

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add mode-specific summaries**

Keep number memory history and leaderboard separate from Schulte data.

**Step 2: Add UI refresh hooks**

Refresh number memory records and leaderboard on login, logout, score updates, and mode switches.

### Task 7: Verify integration and regression safety

**Files:**
- Verify: `大脑训练/index.html`
- Verify: `大脑训练/style.css`
- Verify: `大脑训练/script.js`
- Verify: `大脑训练/script.test.js`

**Step 1: Run automated tests**

Run: `node --test script.test.js`
Expected: PASS with all existing and new tests green.

**Step 2: Verify static wiring**

Check that mode switch markup, number memory containers, and helper exports exist.

**Step 3: Manual browser verification**

Confirm:

- default start length follows previous best plus one
- custom valid lengths work
- success increases length by one
- failure records the longest successful length
- number memory leaderboard ranks users by longest success length only
- Schulte mode still works unchanged
