# Number Memory Real-Time Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make number memory history, best score, and leaderboard update immediately after each successful round.

**Architecture:** Keep the existing number memory mode and change the persistence point from end-of-run to per-success. Update `script.js` so each correct answer writes a record row, upserts the user's best row when appropriate, and refreshes memory summaries immediately, while failures only end the run without duplicating data.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Bmob REST API, Node test runner

---

### Task 1: Add failing tests for real-time number memory persistence flow

**Files:**
- Modify: `大脑训练/script.test.js`
- Test: `大脑训练/script.test.js`

**Step 1: Write the failing test**

Add tests that verify:

- successful rounds trigger immediate record updates
- failed end-of-run does not require an extra duplicate save
- success messaging reflects immediate updates

**Step 2: Run test to verify it fails**

Run: `node --test script.test.js`
Expected: FAIL because the current implementation only persists on failure.

**Step 3: Write minimal implementation**

Adjust `大脑训练/script.js` to persist on each successful round.

**Step 4: Run test to verify it passes**

Run: `node --test script.test.js`
Expected: PASS for the new real-time update tests.

### Task 2: Move persistence to the success path

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add helper for immediate successful-round persistence**

Create a helper that writes the current successful length into `NumberMemoryRecord`, updates `NumberMemoryBest` if needed, and refreshes memory summaries.

**Step 2: Call it after each correct answer**

Run the helper in the successful answer path before moving to the next round.

### Task 3: Remove duplicate final save behavior

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Keep failure as run termination only**

Do not write another record when the player fails after already-logged successful rounds.

**Step 2: Preserve empty-run handling**

If the player fails before any success, keep the current no-score behavior.

### Task 4: Update player feedback

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Improve success messaging**

Show that the successful length has already updated records.

**Step 2: Keep failure messaging clear**

Show the correct answer and final run result without implying an additional save if it already happened.

### Task 5: Verify behavior

**Files:**
- Verify: `大脑训练/script.js`
- Verify: `大脑训练/script.test.js`

**Step 1: Run automated tests**

Run: `node --test script.test.js`
Expected: PASS with all existing and new tests green.

**Step 2: Manual browser verification**

Confirm:

- first success updates history immediately
- second success updates history immediately again
- best score and leaderboard refresh before the run ends
- failing after successes does not create an extra duplicate record
