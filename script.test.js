const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  BMOB_BASE_URL,
  createSequence,
  formatElapsedTime,
  createGameState,
  applyCellSelection,
  buildTextColorIndex,
  buildBoardState,
  validateCredentials,
  registerUser,
  loginUser,
  summarizeScoreRecords,
  createScorePayload,
  summarizeLeaderboardRows,
  createBestScorePayload,
  isMissingClassError,
  buildShareUrl,
  buildShareText,
  parseShareParams,
} = require('./script.js');

const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

test('BMOB_BASE_URL points to the reachable Bmobcloud API host', () => {
  assert.equal(BMOB_BASE_URL, 'https://api.bmobcloud.com/1');
});

test('createSequence returns ascending numbers from 1 to 25', () => {
  assert.deepEqual(createSequence(25), [
    1, 2, 3, 4, 5,
    6, 7, 8, 9, 10,
    11, 12, 13, 14, 15,
    16, 17, 18, 19, 20,
    21, 22, 23, 24, 25,
  ]);
});

test('formatElapsedTime renders seconds and centiseconds', () => {
  assert.equal(formatElapsedTime(0), '00.00s');
  assert.equal(formatElapsedTime(1234), '01.23s');
  assert.equal(formatElapsedTime(9876), '09.87s');
});

test('createGameState starts a playable round at target one', () => {
  const state = createGameState([4, 1, 3, 2]);

  assert.equal(state.nextTarget, 1);
  assert.equal(state.running, true);
  assert.equal(state.completed, false);
  assert.deepEqual(state.clearedNumbers, []);
  assert.deepEqual(state.numbers, [4, 1, 3, 2]);
});

test('applyCellSelection accepts only the current target number', () => {
  const initialState = createGameState([1, 2, 3]);

  const wrongMove = applyCellSelection(initialState, 3);
  assert.equal(wrongMove.status, 'wrong');
  assert.equal(wrongMove.state.nextTarget, 1);
  assert.deepEqual(wrongMove.state.clearedNumbers, []);

  const firstMove = applyCellSelection(initialState, 1);
  assert.equal(firstMove.status, 'correct');
  assert.equal(firstMove.state.nextTarget, 2);
  assert.deepEqual(firstMove.state.clearedNumbers, [1]);
});

test('applyCellSelection completes the round on the last correct number', () => {
  const state = {
    numbers: [1, 2, 3],
    nextTarget: 3,
    running: true,
    completed: false,
    clearedNumbers: [1, 2],
  };

  const result = applyCellSelection(state, 3);

  assert.equal(result.status, 'completed');
  assert.equal(result.state.running, false);
  assert.equal(result.state.completed, true);
  assert.equal(result.state.nextTarget, 4);
  assert.deepEqual(result.state.clearedNumbers, [1, 2, 3]);
});

test('buildTextColorIndex assigns random text colors per cell', () => {
  const picks = [0.02, 0.21, 0.45, 0.69, 0.91, 0.39];
  let callIndex = 0;

  const colorIndexes = buildTextColorIndex([1, 2, 3, 4, 5, 6], () => {
    const value = picks[callIndex];
    callIndex += 1;
    return value;
  });

  assert.deepEqual(colorIndexes, [0, 1, 2, 3, 4, 1]);
});

test('buildBoardState stores one color layout for the whole round', () => {
  const picks = [0.02, 0.21, 0.45, 0.69];
  let callIndex = 0;

  const state = buildBoardState([4, 1, 3, 2], true, () => {
    const value = picks[callIndex];
    callIndex += 1;
    return value;
  });

  assert.deepEqual(state.numbers, [4, 1, 3, 2]);
  assert.deepEqual(state.colorIndexes, [0, 1, 2, 3]);
  assert.equal(state.running, true);

  const move = applyCellSelection(state, 1);
  assert.deepEqual(move.state.colorIndexes, [0, 1, 2, 3]);
});

test('validateCredentials rejects empty username', () => {
  const result = validateCredentials('', '123456');
  assert.equal(result.ok, false);
  assert.match(result.message, /用户名不能为空/);
});

test('validateCredentials rejects empty password', () => {
  const result = validateCredentials('alice', '');
  assert.equal(result.ok, false);
  assert.match(result.message, /密码不能为空/);
});

test('registerUser calls the provided api adapter', async () => {
  const api = {
    registerUser: async (username, password) => ({
      objectId: 'u1',
      username,
      sessionToken: 'token-1',
      password,
    }),
  };

  const result = await registerUser(api, 'alice', '123456');

  assert.equal(result.ok, true);
  assert.equal(result.user.username, 'alice');
  assert.equal(result.user.sessionToken, 'token-1');
});

test('registerUser fills username when Bmob register response omits it', async () => {
  const api = {
    registerUser: async () => ({
      objectId: 'u1',
      createdAt: '2026-03-09 14:35:40',
      sessionToken: 'token-2',
    }),
  };

  const result = await registerUser(api, 'alice', '123456');

  assert.equal(result.ok, true);
  assert.equal(result.user.username, 'alice');
  assert.equal(result.user.sessionToken, 'token-2');
});

test('registerUser surfaces adapter errors', async () => {
  const api = {
    registerUser: async () => {
      throw new Error('用户名已存在');
    },
  };

  const result = await registerUser(api, 'alice', '123456');

  assert.equal(result.ok, false);
  assert.match(result.message, /已存在/);
});

test('loginUser calls the provided api adapter', async () => {
  const api = {
    loginUser: async (username, password) => ({
      objectId: 'u1',
      username,
      sessionToken: `session-${password}`,
    }),
  };

  const result = await loginUser(api, 'alice', '123456');

  assert.equal(result.ok, true);
  assert.equal(result.user.username, 'alice');
  assert.equal(result.user.sessionToken, 'session-123456');
});

test('loginUser surfaces wrong-password errors', async () => {
  const api = {
    loginUser: async () => {
      throw new Error('密码错误');
    },
  };

  const result = await loginUser(api, 'alice', 'bad');

  assert.equal(result.ok, false);
  assert.match(result.message, /密码错误/);
});

test('summarizeScoreRecords returns best and recent scores', () => {
  const result = summarizeScoreRecords([
    { objectId: '3', elapsedMs: 1400, completedAt: '2026-03-09 10:03', colorMode: 'plain' },
    { objectId: '2', elapsedMs: 1100, completedAt: '2026-03-09 10:02', colorMode: 'color' },
    { objectId: '1', elapsedMs: 1200, completedAt: '2026-03-09 10:01', colorMode: 'color' },
  ]);

  assert.equal(result.best.elapsedMs, 1100);
  assert.equal(result.recent.length, 3);
  assert.equal(result.recent[0].objectId, '3');
});

test('createScorePayload stores the active user and round result', () => {
  const payload = createScorePayload(
    { objectId: 'u1', username: 'alice' },
    1250,
    '2026-03-09 11:00',
    true,
  );

  assert.deepEqual(payload, {
    userObjectId: 'u1',
    username: 'alice',
    elapsedMs: 1250,
    completedAt: '2026-03-09 11:00',
    colorMode: 'color',
  });
});

test('createBestScorePayload stores one best score row per user', () => {
  const payload = createBestScorePayload(
    { objectId: 'u1', username: 'alice' },
    980,
    '2026-03-09 12:00:00',
    false,
  );

  assert.deepEqual(payload, {
    userObjectId: 'u1',
    username: 'alice',
    bestElapsedMs: 980,
    bestCompletedAt: '2026-03-09 12:00:00',
    colorMode: 'plain',
  });
});

test('summarizeLeaderboardRows sorts ascending and keeps top twenty', () => {
  const rows = Array.from({ length: 22 }, (_, index) => ({
    objectId: `row-${index + 1}`,
    username: `user-${index + 1}`,
    bestElapsedMs: 3000 - index * 50,
    bestCompletedAt: `2026-03-09 12:${String(index).padStart(2, '0')}:00`,
    colorMode: 'color',
    userObjectId: `u-${index + 1}`,
  }));

  const result = summarizeLeaderboardRows(rows);

  assert.equal(result.length, 20);
  assert.equal(result[0].bestElapsedMs, 1950);
  assert.equal(result[19].bestElapsedMs, 2900);
});

test('isMissingClassError matches missing UserBestScore class responses', () => {
  assert.equal(isMissingClassError(new Error('object not found for UserBestScore.'), 'UserBestScore'), true);
  assert.equal(isMissingClassError(new Error('other message'), 'UserBestScore'), false);
});

test('style.css includes dedicated 720px and 430px mobile breakpoints', () => {
  assert.match(styleCss, /@media \(max-width: 720px\)/);
  assert.match(styleCss, /@media \(max-width: 430px\)/);
});

test('style.css includes compact mobile leaderboard and safe-area spacing rules', () => {
  assert.match(styleCss, /padding: 12px 10px calc\(18px \+ env\(safe-area-inset-bottom\)\);/);
  assert.match(styleCss, /grid-template-columns: 44px minmax\(0, 1fr\);/);
});

test('buildShareUrl creates a score-bearing link', () => {
  const url = buildShareUrl('https://zxy6023.github.io/brain-training/', {
    username: 'alice',
    bestTime: '12.34s',
    completedAt: '2026-03-09 16:00:00',
    mode: 'color',
  });

  assert.match(url, /share=1/);
  assert.match(url, /user=alice/);
  assert.match(url, /best=12.34s/);
});

test('buildShareText produces readable share copy', () => {
  const text = buildShareText({
    username: 'alice',
    bestTime: '12.34s',
    completedAt: '2026-03-09 16:00:00',
    mode: 'color',
    url: 'https://zxy6023.github.io/brain-training/?share=1',
  });

  assert.match(text, /alice/);
  assert.match(text, /12.34s/);
  assert.match(text, /彩色模式/);
  assert.match(text, /https:\/\/zxy6023.github.io\/brain-training\/\?share=1/);
});

test('parseShareParams reads valid share data from url', () => {
  const payload = parseShareParams('https://zxy6023.github.io/brain-training/?share=1&user=alice&best=12.34s&doneAt=2026-03-09%2016%3A00%3A00&mode=color');

  assert.deepEqual(payload, {
    username: 'alice',
    bestTime: '12.34s',
    completedAt: '2026-03-09 16:00:00',
    mode: 'color',
  });
});

test('parseShareParams ignores incomplete share payloads', () => {
  assert.equal(parseShareParams('https://zxy6023.github.io/brain-training/?share=1&user=alice'), null);
});
