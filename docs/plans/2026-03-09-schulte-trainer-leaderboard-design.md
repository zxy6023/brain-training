## Schulte Trainer Leaderboard Design

### Goal

Add a global leaderboard to the Bmob-backed Schulte trainer so the page shows the top 20 users ranked by their best recorded completion time.

### Chosen Approach

Introduce a dedicated `UserBestScore` class in Bmob. Each user keeps at most one best-score row in this class, while `ScoreRecord` continues to store full history for personal records.

### Data Model

`ScoreRecord` remains unchanged and continues to store every completed run.

`UserBestScore` will store one row per user with:

- `userObjectId`
- `username`
- `bestElapsedMs`
- `bestCompletedAt`
- `colorMode`

### Update Flow

- On round completion, save the full run into `ScoreRecord`.
- Then query `UserBestScore` for the current user.
- If no row exists, create one.
- If a row exists and the new result is faster, update it.
- If the new result is slower, leave the best row unchanged.

### Leaderboard Query

- Query `UserBestScore` ordered by `bestElapsedMs` ascending.
- Limit the result to 20 rows.
- Show the current user row with a visual highlight when present.

### UI Changes

- Add a new leaderboard card below the existing personal records card.
- The card title is `全站前20`.
- Each row shows ranking number, username, best time, and completed time.
- When there are no rows yet, show a clear empty-state message.

### Error Handling

- Leaderboard load failure must not block gameplay.
- If saving the run succeeds but best-score update fails, personal history still remains valid and the leaderboard can recover on a later refresh.
- Failed leaderboard reads show a friendly message in the leaderboard panel.

### Validation

Verify that:

- one user only keeps one leaderboard row
- a faster result updates that row
- a slower result does not overwrite that row
- the page displays the top 20 best users in ascending order
- the current user row is highlighted when present
- leaderboard load errors do not block training
