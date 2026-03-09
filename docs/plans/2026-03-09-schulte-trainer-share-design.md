## Schulte Trainer Best Score Share Design

### Goal

Add a best-score sharing feature that lets the user generate one-click share text and a score-bearing network link, then display a share card when that link is opened.

### Chosen Approach

Use client-side URL query parameters to encode the best-score display data. This avoids creating a new backend model while still making shared links meaningful when opened on GitHub Pages.

### Share Inputs

The feature uses the current user's best score data and generates:

- a ready-to-send share text block
- a score-bearing share URL

The shared URL includes only non-sensitive display data:

- `share=1`
- `user`
- `best`
- `doneAt`
- `mode`

### UI Changes

- Add a share action near the best score card.
- Add one action to copy the full share text.
- Add one action to copy the generated link.
- Add a share preview card that appears when a valid shared link is opened.

### Share Card Behavior

- The share card appears near the top of the main content when URL parameters are valid.
- It displays username, best score, completed time, and color mode.
- It does not block normal login, training, or leaderboard usage.

### Error Handling

- No best score: share actions stay disabled or show a clear prompt.
- Invalid or incomplete share parameters: do not render the share card.
- Clipboard failure: show a friendly message and leave the share content visible enough for manual copy.

### Validation

Verify that:

- share text is generated from the current best score
- share links include score-related query parameters
- opening a valid share link renders the share card
- opening a normal page without share parameters does not show the card
- share actions work on both desktop and mobile layouts
