# Schulte Trainer Leaderboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a global top-20 leaderboard backed by a `UserBestScore` Bmob class while preserving personal history and current gameplay.

**Architecture:** Keep `ScoreRecord` for full per-user history and add a second Bmob class, `UserBestScore`, for one best row per user. Extend `script.js` with best-score upsert helpers and leaderboard query helpers, add leaderboard markup in `index.html`, and style the new panel in `style.css`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Bmob REST API, Node test runner

---

### Task 1: Add failing tests for leaderboard helpers

**Files:**
- Modify: `大脑训练/script.test.js`
- Test: `大脑训练/script.test.js`

**Step 1: Write the failing test**

Add tests for helper behavior covering:

- building a `UserBestScore` payload from the current user and score
- keeping only the top 20 leaderboard entries
- ordering leaderboard entries by best time ascending

**Step 2: Run test to verify it fails**

Run: `node --test script.test.js`
Expected: FAIL because the leaderboard helpers do not exist yet.

**Step 3: Write minimal implementation**

Add the new pure helper functions in `大脑训练/script.js` and export them.

**Step 4: Run test to verify it passes**

Run: `node --test script.test.js`
Expected: PASS for the new leaderboard helper tests.

### Task 2: Add leaderboard markup

**Files:**
- Modify: `大脑训练/index.html`

**Step 1: Add leaderboard card**

Create a new section below the personal record panel with:

- title `全站前20`
- empty-state text
- leaderboard list container

**Step 2: Add stable IDs**

Expose IDs for the leaderboard empty-state and list so `script.js` can update them.

### Task 3: Add leaderboard styles

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Style the leaderboard card**

Match the existing record card style and keep the layout responsive.

**Step 2: Style row states**

Add clear styles for ranking number, username, score, date, and current-user highlight.

### Task 4: Add Bmob leaderboard API helpers

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add constants and payload helper**

Add a `USER_BEST_SCORE_CLASS_NAME` constant and a helper to build best-score rows.

**Step 2: Add query helpers**

Implement helpers to:

- fetch the current user's best-score row
- fetch the global top 20 rows
- create a best-score row
- update a best-score row

### Task 5: Update completion flow to maintain best scores

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Save full history as before**

Keep the existing `ScoreRecord` write.

**Step 2: Upsert `UserBestScore`**

After saving the run, create or update the user's single best-score row based on whether the new result is faster.

### Task 6: Render the leaderboard in the page

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add leaderboard state**

Store the current leaderboard rows separately from personal history.

**Step 2: Add rendering logic**

Render the top 20 rows into the leaderboard card and highlight the current user when present.

**Step 3: Refresh on the right events**

Reload the leaderboard on page start, login, logout, and score updates.

### Task 7: Verify behavior

**Files:**
- Verify: `大脑训练/index.html`
- Verify: `大脑训练/style.css`
- Verify: `大脑训练/script.js`
- Verify: `大脑训练/script.test.js`

**Step 1: Run automated tests**

Run: `node --test script.test.js`
Expected: PASS with all leaderboard and existing behavior tests green.

**Step 2: Verify static wiring**

Confirm the leaderboard markup and helper exports exist.

**Step 3: Manual browser verification**

Confirm:

- two or more users can produce scores
- only each user's best score appears in the leaderboard source table
- the page shows the top 20 ranked by best time
- the current user's row is highlighted when present
