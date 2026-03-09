# Schulte Trainer Best Score Share Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add one-click best-score sharing that generates share text and a score-bearing URL, and render a share card when the link is opened.

**Architecture:** Keep the feature entirely on the client side. Extend `script.js` with helpers to build share payloads, parse query parameters, generate share text, and copy content to the clipboard. Add share actions and a share preview card in `index.html`, and style them in `style.css` to match the existing card system on desktop and mobile.

**Tech Stack:** HTML, CSS, vanilla JavaScript, URLSearchParams, Clipboard API, Node test runner

---

### Task 1: Add failing tests for share helpers

**Files:**
- Modify: `大脑训练/script.test.js`
- Test: `大脑训练/script.test.js`

**Step 1: Write the failing test**

Add tests for helper behavior covering:

- building a share URL with score parameters
- generating readable share text from best-score data
- parsing valid share parameters from a URL string
- ignoring invalid share payloads

**Step 2: Run test to verify it fails**

Run: `node --test script.test.js`
Expected: FAIL because the share helpers do not exist yet.

**Step 3: Write minimal implementation**

Add pure share helper functions in `大脑训练/script.js` and export them.

**Step 4: Run test to verify it passes**

Run: `node --test script.test.js`
Expected: PASS for the new share helper tests.

### Task 2: Add share UI markup

**Files:**
- Modify: `大脑训练/index.html`

**Step 1: Add share actions to best score card**

Add buttons for:

- copy share text
- copy share link

**Step 2: Add share preview card**

Add a card that becomes visible when a valid shared link is opened.

### Task 3: Add share styles

**Files:**
- Modify: `大脑训练/style.css`

**Step 1: Style share action buttons**

Keep them visually aligned with the current record card style.

**Step 2: Style the share preview card**

Make it distinct enough to notice without overpowering the page.

### Task 4: Add share helpers and URL parsing

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Add helper functions**

Implement helpers to:

- build a shareable URL
- generate share text
- parse and validate query parameters

**Step 2: Add share state**

Store the parsed shared-result payload separately from the live logged-in state.

### Task 5: Wire best-score sharing actions

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Enable share actions only when a best score exists**

Keep the buttons disabled or guarded until the current user has a best score.

**Step 2: Implement copy actions**

Use the Clipboard API when available and provide readable failure feedback otherwise.

### Task 6: Render the shared-result card on page load

**Files:**
- Modify: `大脑训练/script.js`

**Step 1: Parse query parameters on startup**

If the URL contains a valid share payload, render the share card.

**Step 2: Preserve normal app behavior**

Do not block login, training, records, or leaderboard usage when a share card is shown.

### Task 7: Verify feature behavior

**Files:**
- Verify: `大脑训练/index.html`
- Verify: `大脑训练/style.css`
- Verify: `大脑训练/script.js`
- Verify: `大脑训练/script.test.js`

**Step 1: Run automated tests**

Run: `node --test script.test.js`
Expected: PASS with all share tests and existing tests green.

**Step 2: Verify static wiring**

Confirm the share buttons, share preview card, and share helper exports exist.

**Step 3: Manual browser verification**

Confirm:

- a user with a best score can copy share text and link
- opening the share URL renders the share card
- invalid share parameters do not break the page
- mobile layout keeps the share card readable
