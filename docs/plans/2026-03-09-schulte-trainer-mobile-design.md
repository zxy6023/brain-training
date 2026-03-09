## Schulte Trainer Mobile Adaptation Design

### Goal

Improve the mobile experience of the Bmob-backed Schulte trainer so login, gameplay, records, and leaderboard all remain comfortable and readable on common phone widths.

### Chosen Approach

Keep the current single-page structure and strengthen responsive behavior with additional mobile-first breakpoints. The adaptation will focus on spacing, card density, button touch size, grid readability, and stacked information layout for records and leaderboard rows.

### Layout Strategy

- Keep the existing document order.
- On mobile, emphasize a clear vertical flow: header, auth, controls, status, grid, result, records, leaderboard.
- Reduce card padding and radius slightly on small screens while preserving tap-friendly targets.

### Control and Status Changes

- Stack control actions more clearly on smaller widths.
- Give action buttons and toggles stronger full-width touch targets.
- Make target and timer cards more compact without reducing readability.

### Grid Changes

- Preserve the 5x5 grid on all screens.
- Tighten gaps and scale cell typography by viewport width.
- Keep touch targets large enough for one-handed use.

### Records and Leaderboard Changes

- Convert dense horizontal rows into more phone-friendly stacked or two-column layouts.
- Keep username, score, and timestamp readable without overlap.
- Preserve current-user highlight in the leaderboard on small screens.

### Breakpoints

- Keep the current tablet breakpoint behavior.
- Add an intermediate mobile breakpoint for common phone widths.
- Add a narrow-phone breakpoint for compact screens around 390px to 430px.

### Validation

Verify that:

- there is no horizontal scrolling on narrow screens
- auth forms, controls, and grid remain comfortable to tap
- leaderboard rows do not overlap or overflow
- records and result messages remain readable on mobile widths
- the page still feels consistent with the existing visual style
