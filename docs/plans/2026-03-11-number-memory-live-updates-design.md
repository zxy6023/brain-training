## Number Memory Real-Time Update Design

### Goal

Change number memory scoring so records, best score, and leaderboard update immediately after each successful round instead of waiting for the full run to fail.

### Chosen Approach

Persist number memory progress on every successful answer. Each success writes a new history row, updates the user's best row when the new length is higher, and refreshes the on-page summaries right away.

### Update Rules

- Each correct round immediately records the current successful length.
- `NumberMemoryRecord` stores each successful milestone.
- `NumberMemoryBest` updates only when the new successful length is greater than the existing best.
- Failure ends the run but does not create an extra duplicate record.

### UI Behavior

- `当前最高` updates immediately after each correct answer.
- `最近5次` updates immediately after each correct answer.
- `最长成功长度` updates immediately when surpassed.
- `排行榜` refreshes immediately after each correct answer.
- Success messages should clearly state that the record has been updated.

### Data Behavior

- History rows can contain consecutive successful milestones from one run.
- Best-score rows remain one-per-user.
- Leaderboard still ranks by best successful length descending.

### Validation

Verify that:

- the first successful round updates history immediately
- the second successful round updates history and best score immediately
- failing after prior successes does not add a duplicate result row
- leaderboard keeps one best row per user
- Schulte mode remains unchanged
