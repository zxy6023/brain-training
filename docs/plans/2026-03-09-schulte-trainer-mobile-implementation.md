# Schulte Trainer Mobile Adaptation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the Schulte trainer layout and interaction density for phones while preserving the existing desktop design and gameplay.

**Architecture:** Keep the current HTML structure and focus the work in `style.css`, with optional small static-verification tests in `script.test.js`. Add mobile-specific breakpoints for common phone widths, refine stacked control layout, tighten spacing, and make records and leaderboard rows easier to read on narrow screens.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node test runner

---

### Task 1: Add failing mobile CSS verification tests

**Files:**
- Modify: `大脑训练/script.test.js`
- Test: `大脑训练/script.test.js`

**Step 1: Write the failing test**

Add tests that verify:

- `style.css` includes a `720px` mobile breakpoint
- `style.css` includes a `430px` narrow-phone breakpoint
- the mobile styles include compact leaderboard and safe-area-aware spacing rules

**Step 2: Run test to verify it fails**

Run: `node --test script.test.js`
Expected: FAIL because the new mobile rules do not exist yet.

**Step 3: Write minimal implementation**

Add the required responsive CSS rules to `大脑训练/style.css`.

**Step 4: Run test to verify it passes**

Run: `node --test script.test.js`
Expected: PASS for the new mobile verification tests.

### Task 2: Tighten phone layout spacing

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Add intermediate mobile breakpoint**

Create a `720px` breakpoint that reduces padding, card density, and gaps.

**Step 2: Add narrow-phone breakpoint**

Create a `430px` breakpoint for more compact spacing and typography on small screens.

### Task 3: Improve control and status layout on phones

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Reflow control area**

Stack start, reset, and mode toggle more clearly on mobile.

**Step 2: Improve status card readability**

Adjust status card padding, sizing, and spacing for smaller screens.

### Task 4: Improve grid usability on phones

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Tune grid spacing**

Reduce gaps while keeping the 5x5 layout comfortable.

**Step 2: Tune cell size and text scale**

Adjust font size and radius so cells stay tappable and readable.

### Task 5: Improve records and leaderboard on phones

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Make records more vertical**

Ensure time and date do not crowd each other on small screens.

**Step 2: Make leaderboard rows compact and readable**

Keep rank, username, score, and time readable without overlap, including the current-user highlight.

### Task 6: Verify static behavior

**Files:**
- Verify: `大脑训练/style.css`
- Verify: `大脑训练/index.html`
- Verify: `大脑训练/script.test.js`

**Step 1: Run automated tests**

Run: `node --test script.test.js`
Expected: PASS with all existing tests plus mobile verification tests green.

**Step 2: Verify responsive wiring**

Check that the stylesheet contains the intended breakpoints and mobile row/layout rules.

**Step 3: Manual browser verification**

Open the page on a narrow responsive viewport and confirm:

- no horizontal scrolling
- controls stack cleanly
- grid remains readable and tappable
- records and leaderboard rows do not overflow
