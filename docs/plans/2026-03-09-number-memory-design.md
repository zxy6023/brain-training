## Number Memory Training Design

### Goal

Add a number memory training mode to the existing brain training site. The new mode should let the user choose a starting sequence length, default that value to the user's last best successful length plus one, and rank users by their longest successful remembered length.

### Chosen Approach

Keep the current single-page app and add a second training mode alongside Schulte table training. Use the same login/session layer and add separate Bmob classes for number memory history and number memory best scores so the new mode has its own records and leaderboard.

### Gameplay

- The user switches to `数字记忆` mode.
- A starting length input is shown.
- The default value is:
  - previous best successful length plus one, if the user has history
  - otherwise `3`
- The game shows a random digit sequence.
- After a short display period, the sequence is hidden.
- The user inputs the sequence exactly.
- If correct, the next round increases length by one.
- If incorrect, the run ends and the score is the longest successful length from that run.

### UI Structure

- Add a visible mode switch between `舒尔特表` and `数字记忆`.
- Keep one shared login area.
- For number memory mode, show:
  - start length input
  - start button
  - current target length
  - sequence display area
  - answer input
  - submit button
  - round result/status text
- Add separate record and leaderboard sections for number memory.

### Data Model

Use separate Bmob classes for this mode:

- `NumberMemoryRecord`
  - `userObjectId`
  - `username`
  - `startLength`
  - `bestSuccessLength`
  - `completedAt`
- `NumberMemoryBest`
  - `userObjectId`
  - `username`
  - `bestSuccessLength`
  - `bestCompletedAt`

### Ranking Rules

- The leaderboard is specific to number memory mode.
- Ranking uses `bestSuccessLength` descending.
- Each user has only one best-score row in `NumberMemoryBest`.
- A new result only updates that row if it is better.

### Limits and Edge Handling

- Start length minimum: `2`
- Start length maximum: `20`
- Invalid start length shows a clear message and does not start the game.
- A run only counts if at least one round was solved successfully.
- Sharing is not extended to number memory in this version.

### Validation

Verify that:

- the default starting length comes from the user's previous best plus one
- custom starting length works within the allowed range
- correct answers increase the next round length
- incorrect answers end the run and record the longest successful length
- personal records and leaderboard update from number memory data only
- Schulte table behavior remains unchanged
