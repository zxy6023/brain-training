(function () {
  const BMOB_BASE_URL = 'https://api.bmobcloud.com/1';
  const BMOB_APP_ID = 'faa5d29a689c833d79ee22ec347436df';
  const BMOB_API_KEY = '5191e34202c12298cb09cfc916becb03';
  const SCORE_CLASS_NAME = 'ScoreRecord';
  const USER_BEST_SCORE_CLASS_NAME = 'UserBestScore';
  const NUMBER_MEMORY_RECORD_CLASS_NAME = 'NumberMemoryRecord';
  const NUMBER_MEMORY_BEST_CLASS_NAME = 'NumberMemoryBest';
  const SESSION_STORAGE_KEY = 'schulte-trainer-bmob-session';

  const root = typeof document !== 'undefined' ? document.querySelector('.app-shell') : null;
  const gridElement = typeof document !== 'undefined' ? document.getElementById('grid') : null;
  const targetElement = typeof document !== 'undefined' ? document.getElementById('targetValue') : null;
  const timerElement = typeof document !== 'undefined' ? document.getElementById('timerValue') : null;
  const messageElement = typeof document !== 'undefined' ? document.getElementById('message') : null;
  const resultPanel = typeof document !== 'undefined' ? document.getElementById('resultPanel') : null;
  const resultText = typeof document !== 'undefined' ? document.getElementById('resultText') : null;
  const startButton = typeof document !== 'undefined' ? document.getElementById('startButton') : null;
  const resetButton = typeof document !== 'undefined' ? document.getElementById('resetButton') : null;
  const colorToggle = typeof document !== 'undefined' ? document.getElementById('colorToggle') : null;
  const clearRecordsButton = typeof document !== 'undefined' ? document.getElementById('clearRecordsButton') : null;
  const bestRecordValue = typeof document !== 'undefined' ? document.getElementById('bestRecordValue') : null;
  const recordsEmpty = typeof document !== 'undefined' ? document.getElementById('recordsEmpty') : null;
  const recordsList = typeof document !== 'undefined' ? document.getElementById('recordsList') : null;
  const copyShareTextButton = typeof document !== 'undefined' ? document.getElementById('copyShareTextButton') : null;
  const copyShareLinkButton = typeof document !== 'undefined' ? document.getElementById('copyShareLinkButton') : null;
  const shareMessage = typeof document !== 'undefined' ? document.getElementById('shareMessage') : null;
  const sharePreviewCard = typeof document !== 'undefined' ? document.getElementById('sharePreviewCard') : null;
  const sharePreviewText = typeof document !== 'undefined' ? document.getElementById('sharePreviewText') : null;
  const leaderboardEmpty = typeof document !== 'undefined' ? document.getElementById('leaderboardEmpty') : null;
  const leaderboardList = typeof document !== 'undefined' ? document.getElementById('leaderboardList') : null;
  const registerForm = typeof document !== 'undefined' ? document.getElementById('registerForm') : null;
  const loginForm = typeof document !== 'undefined' ? document.getElementById('loginForm') : null;
  const registerUsername = typeof document !== 'undefined' ? document.getElementById('registerUsername') : null;
  const registerPassword = typeof document !== 'undefined' ? document.getElementById('registerPassword') : null;
  const loginUsername = typeof document !== 'undefined' ? document.getElementById('loginUsername') : null;
  const loginPassword = typeof document !== 'undefined' ? document.getElementById('loginPassword') : null;
  const currentUserValue = typeof document !== 'undefined' ? document.getElementById('currentUserValue') : null;
  const authMessage = typeof document !== 'undefined' ? document.getElementById('authMessage') : null;
  const logoutButton = typeof document !== 'undefined' ? document.getElementById('logoutButton') : null;
  const schulteModeButton = typeof document !== 'undefined' ? document.getElementById('schulteModeButton') : null;
  const numberMemoryModeButton = typeof document !== 'undefined' ? document.getElementById('numberMemoryModeButton') : null;
  const schulteModePanel = typeof document !== 'undefined' ? document.getElementById('schulteModePanel') : null;
  const numberMemoryModePanel = typeof document !== 'undefined' ? document.getElementById('numberMemoryModePanel') : null;
  const memoryStartLengthInput = typeof document !== 'undefined' ? document.getElementById('memoryStartLengthInput') : null;
  const memoryStartButton = typeof document !== 'undefined' ? document.getElementById('memoryStartButton') : null;
  const memoryCurrentLengthValue = typeof document !== 'undefined' ? document.getElementById('memoryCurrentLengthValue') : null;
  const memoryRunBestValue = typeof document !== 'undefined' ? document.getElementById('memoryRunBestValue') : null;
  const memoryMessage = typeof document !== 'undefined' ? document.getElementById('memoryMessage') : null;
  const memorySequenceDisplay = typeof document !== 'undefined' ? document.getElementById('memorySequenceDisplay') : null;
  const memoryAnswerInput = typeof document !== 'undefined' ? document.getElementById('memoryAnswerInput') : null;
  const memorySubmitButton = typeof document !== 'undefined' ? document.getElementById('memorySubmitButton') : null;
  const clearMemoryRecordsButton = typeof document !== 'undefined' ? document.getElementById('clearMemoryRecordsButton') : null;
  const memoryBestValue = typeof document !== 'undefined' ? document.getElementById('memoryBestValue') : null;
  const memoryRecordsEmpty = typeof document !== 'undefined' ? document.getElementById('memoryRecordsEmpty') : null;
  const memoryRecordsList = typeof document !== 'undefined' ? document.getElementById('memoryRecordsList') : null;
  const memoryLeaderboardEmpty = typeof document !== 'undefined' ? document.getElementById('memoryLeaderboardEmpty') : null;
  const memoryLeaderboardList = typeof document !== 'undefined' ? document.getElementById('memoryLeaderboardList') : null;

  let timerId = null;
  let roundStart = 0;
  let currentState = createIdleState(shuffleArray(createSequence(25)));
  let activeMode = 'schulte';
  let currentSession = readSession();
  let currentSummary = emptySummary();
  let currentLeaderboard = [];
  let leaderboardMessage = '还没有排行榜数据。';
  let currentSharePayload = parseShareParams(typeof window !== 'undefined' ? window.location.href : '');
  let numberMemoryState = createNumberMemoryState(3);
  let memorySummary = emptyNumberMemorySummary();
  let memoryLeaderboard = [];
  let memoryLeaderboardMessage = '还没有数字记忆排行榜数据。';
  let memoryHideTimer = null;
  const bmobApi = typeof fetch === 'function' ? createBmobApi(fetch.bind(typeof window !== 'undefined' ? window : globalThis)) : null;

  function createSequence(limit) {
    return Array.from({ length: limit }, (_, index) => index + 1);
  }

  function shuffleArray(values) {
    const cloned = values.slice();
    for (let index = cloned.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = cloned[index];
      cloned[index] = cloned[swapIndex];
      cloned[swapIndex] = current;
    }
    return cloned;
  }

  function formatElapsedTime(milliseconds) {
    const totalCentiseconds = Math.floor(milliseconds / 10);
    const seconds = Math.floor(totalCentiseconds / 100);
    const centiseconds = totalCentiseconds % 100;
    return `${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}s`;
  }

  function buildTextColorIndex(numbers, randomSource) {
    const nextRandom = randomSource || Math.random;
    return numbers.map(() => Math.floor(nextRandom() * 5));
  }

  function buildBoardState(numbers, isRunning, randomSource) {
    return {
      numbers: numbers.slice(),
      nextTarget: 1,
      running: isRunning,
      completed: false,
      clearedNumbers: [],
      colorIndexes: buildTextColorIndex(numbers, randomSource),
    };
  }

  function createIdleState(numbers) {
    return buildBoardState(numbers, false);
  }

  function createGameState(numbers, colorIndexes) {
    const state = buildBoardState(numbers, true);
    if (Array.isArray(colorIndexes)) {
      state.colorIndexes = colorIndexes.slice();
    }
    return state;
  }

  function applyCellSelection(state, selectedNumber) {
    const colorIndexes = Array.isArray(state.colorIndexes)
      ? state.colorIndexes.slice()
      : state.numbers.map(() => -1);

    if (!state.running || state.completed) {
      return { status: 'idle', state };
    }

    if (selectedNumber !== state.nextTarget) {
      return { status: 'wrong', state };
    }

    const clearedNumbers = state.clearedNumbers.concat(selectedNumber);
    const nextTarget = state.nextTarget + 1;
    const completed = clearedNumbers.length === state.numbers.length;

    return {
      status: completed ? 'completed' : 'correct',
      state: {
        numbers: state.numbers.slice(),
        nextTarget,
        running: !completed,
        completed,
        clearedNumbers,
        colorIndexes,
      },
    };
  }

  function validateCredentials(username, password) {
    const trimmedUsername = String(username || '').trim();
    const rawPassword = String(password || '');

    if (!trimmedUsername) {
      return { ok: false, message: '用户名不能为空' };
    }

    if (!rawPassword) {
      return { ok: false, message: '密码不能为空' };
    }

    return { ok: true, username: trimmedUsername, password: rawPassword };
  }

  function extractErrorMessage(error, fallback) {
    if (error && typeof error === 'object' && 'message' in error && error.message) {
      return String(error.message);
    }
    if (typeof error === 'string' && error) {
      return error;
    }
    return fallback;
  }

  function isMissingClassError(error, className) {
    const message = extractErrorMessage(error, '');
    return message.includes(`object not found for ${className}`);
  }

  function normalizeSession(user, fallbackUsername) {
    if (!user || typeof user !== 'object') {
      return null;
    }

    const objectId = String(user.objectId || '');
    const username = String(user.username || fallbackUsername || '');
    const sessionToken = String(user.sessionToken || '');

    if (!objectId || !username || !sessionToken) {
      return null;
    }

    return { objectId, username, sessionToken };
  }

  function readSession(storage) {
    const targetStorage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) {
      return null;
    }

    try {
      return normalizeSession(JSON.parse(targetStorage.getItem(SESSION_STORAGE_KEY) || 'null'));
    } catch (error) {
      return null;
    }
  }

  function saveSession(session, storage) {
    const targetStorage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) {
      return;
    }

    const normalized = normalizeSession(session);
    if (!normalized) {
      return;
    }

    targetStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
  }

  function clearSession(storage) {
    const targetStorage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) {
      return;
    }

    targetStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function formatCompletedAt(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function normalizeScoreRecord(record) {
    return {
      objectId: String(record.objectId || ''),
      elapsedMs: Number(record.elapsedMs || 0),
      completedAt: String(record.completedAt || ''),
      colorMode: String(record.colorMode || 'color'),
      username: String(record.username || ''),
      userObjectId: String(record.userObjectId || ''),
    };
  }

  function normalizeBestScoreRecord(record) {
    return {
      objectId: String(record.objectId || ''),
      userObjectId: String(record.userObjectId || ''),
      username: String(record.username || ''),
      bestElapsedMs: Number(record.bestElapsedMs || 0),
      bestCompletedAt: String(record.bestCompletedAt || ''),
      colorMode: String(record.colorMode || 'color'),
    };
  }

  function emptySummary() {
    return { best: null, recent: [] };
  }

  function summarizeScoreRecords(records) {
    const safeRecords = Array.isArray(records)
      ? records
          .map(normalizeScoreRecord)
          .filter((item) => item.objectId && Number.isFinite(item.elapsedMs) && item.elapsedMs > 0)
      : [];

    if (!safeRecords.length) {
      return emptySummary();
    }

    const best = safeRecords.slice().sort((left, right) => left.elapsedMs - right.elapsedMs)[0] || null;
    const recent = safeRecords
      .slice()
      .sort((left, right) => String(right.completedAt).localeCompare(String(left.completedAt)))
      .slice(0, 5);

    return { best, recent };
  }

  function summarizeLeaderboardRows(rows) {
    const safeRows = Array.isArray(rows)
      ? rows
          .map(normalizeBestScoreRecord)
          .filter((item) => item.objectId && item.username && Number.isFinite(item.bestElapsedMs) && item.bestElapsedMs > 0)
      : [];

    return safeRows
      .sort((left, right) => left.bestElapsedMs - right.bestElapsedMs || String(left.bestCompletedAt).localeCompare(String(right.bestCompletedAt)))
      .slice(0, 20);
  }

  function createScorePayload(user, elapsedMs, completedAt, colorEnabled) {
    return {
      userObjectId: user.objectId,
      username: user.username,
      elapsedMs,
      completedAt,
      colorMode: colorEnabled ? 'color' : 'plain',
    };
  }

  function createBestScorePayload(user, elapsedMs, completedAt, colorEnabled) {
    return {
      userObjectId: user.objectId,
      username: user.username,
      bestElapsedMs: elapsedMs,
      bestCompletedAt: completedAt,
      colorMode: colorEnabled ? 'color' : 'plain',
    };
  }

  function sanitizeNumberMemoryStartLength(value) {
    const parsed = Number.parseInt(String(value || '').trim(), 10);
    if (!Number.isFinite(parsed)) {
      return 3;
    }
    return Math.max(2, Math.min(20, parsed));
  }

  function validateNumberMemoryStartLength(value) {
    const parsed = Number.parseInt(String(value || '').trim(), 10);
    if (!Number.isFinite(parsed)) {
      return { ok: false, message: '请输入 2 到 20 之间的起始长度。' };
    }
    if (parsed < 2 || parsed > 20) {
      return { ok: false, message: '起始长度需在 2 到 20 之间。' };
    }
    return { ok: true, value: parsed };
  }

  function getDefaultNumberMemoryStartLength(previousBestLength) {
    if (!Number.isFinite(previousBestLength) || previousBestLength <= 0) {
      return 3;
    }
    return sanitizeNumberMemoryStartLength(previousBestLength + 1);
  }

  function createNumberMemorySequence(length, randomSource) {
    const nextRandom = randomSource || Math.random;
    return Array.from({ length }, () => String(Math.floor(nextRandom() * 10))).join('');
  }

  function createNumberMemoryState(startLength) {
    const safeLength = sanitizeNumberMemoryStartLength(startLength);
    return {
      status: 'idle',
      startLength: safeLength,
      currentLength: safeLength,
      currentSequence: '',
      longestSuccessLength: 0,
      awaitingInput: false,
    };
  }

  function emptyNumberMemorySummary() {
    return { best: null, recent: [] };
  }

  function normalizeNumberMemoryRecord(record) {
    return {
      objectId: String(record.objectId || ''),
      userObjectId: String(record.userObjectId || ''),
      username: String(record.username || ''),
      startLength: Number(record.startLength || 0),
      bestSuccessLength: Number(record.bestSuccessLength || 0),
      completedAt: String(record.completedAt || ''),
    };
  }

  function normalizeNumberMemoryBestRecord(record) {
    return {
      objectId: String(record.objectId || ''),
      userObjectId: String(record.userObjectId || ''),
      username: String(record.username || ''),
      bestSuccessLength: Number(record.bestSuccessLength || 0),
      bestCompletedAt: String(record.bestCompletedAt || ''),
    };
  }

  function summarizeNumberMemoryRecords(records) {
    const safeRecords = Array.isArray(records)
      ? records
          .map(normalizeNumberMemoryRecord)
          .filter((item) => item.objectId && item.bestSuccessLength > 0)
      : [];

    if (!safeRecords.length) {
      return emptyNumberMemorySummary();
    }

    const best = safeRecords.slice().sort((left, right) => right.bestSuccessLength - left.bestSuccessLength || String(right.completedAt).localeCompare(String(left.completedAt)))[0] || null;
    const recent = safeRecords
      .slice()
      .sort((left, right) => String(right.completedAt).localeCompare(String(left.completedAt)))
      .slice(0, 5);

    return { best, recent };
  }

  function summarizeNumberMemoryLeaderboardRows(rows) {
    const safeRows = Array.isArray(rows)
      ? rows
          .map(normalizeNumberMemoryBestRecord)
          .filter((item) => item.objectId && item.username && item.bestSuccessLength > 0)
      : [];

    const bestByUser = new Map();
    safeRows.forEach((item) => {
      const key = item.userObjectId || item.username;
      const existing = bestByUser.get(key);
      if (!existing || item.bestSuccessLength > existing.bestSuccessLength || (item.bestSuccessLength === existing.bestSuccessLength && String(item.bestCompletedAt) < String(existing.bestCompletedAt))) {
        bestByUser.set(key, item);
      }
    });

    return Array.from(bestByUser.values())
      .sort((left, right) => right.bestSuccessLength - left.bestSuccessLength || String(left.bestCompletedAt).localeCompare(String(right.bestCompletedAt)))
      .slice(0, 20);
  }

  function createNumberMemoryRecordPayload(user, startLength, bestSuccessLength, completedAt) {
    return {
      userObjectId: user.objectId,
      username: user.username,
      startLength,
      bestSuccessLength,
      completedAt,
    };
  }

  function createNumberMemoryBestPayload(user, bestSuccessLength, completedAt) {
    return {
      userObjectId: user.objectId,
      username: user.username,
      bestSuccessLength,
      bestCompletedAt: completedAt,
    };
  }

  function buildShareUrl(baseUrl, payload) {
    const url = new URL(baseUrl);
    url.searchParams.set('share', '1');
    url.searchParams.set('user', payload.username);
    url.searchParams.set('best', payload.bestTime);
    url.searchParams.set('doneAt', payload.completedAt);
    url.searchParams.set('mode', payload.mode);
    return url.toString();
  }

  function buildShareText(payload) {
    const modeLabel = payload.mode === 'color' ? '彩色模式' : '纯色模式';
    return `${payload.username} 在舒尔特表训练中刷新了最佳成绩：${payload.bestTime}\n完成时间：${payload.completedAt}\n训练模式：${modeLabel}\n来挑战一下：${payload.url}`;
  }

  function parseShareParams(urlString) {
    if (!urlString) {
      return null;
    }

    let url;
    try {
      url = new URL(urlString);
    } catch (error) {
      return null;
    }

    if (url.searchParams.get('share') !== '1') {
      return null;
    }

    const username = String(url.searchParams.get('user') || '').trim();
    const bestTime = String(url.searchParams.get('best') || '').trim();
    const completedAt = String(url.searchParams.get('doneAt') || '').trim();
    const mode = String(url.searchParams.get('mode') || '').trim();

    if (!username || !bestTime || !completedAt || !mode) {
      return null;
    }

    if (mode !== 'color' && mode !== 'plain') {
      return null;
    }

    return {
      username,
      bestTime,
      completedAt,
      mode,
    };
  }

  function createBmobApi(fetchImpl) {
    async function request(path, options, sessionToken) {
      const response = await fetchImpl(`${BMOB_BASE_URL}${path}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Bmob-Application-Id': BMOB_APP_ID,
          'X-Bmob-REST-API-Key': BMOB_API_KEY,
          ...(sessionToken ? { 'X-Bmob-Session-Token': sessionToken } : {}),
          ...(options.headers || {}),
        },
        body: options.body,
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (error) {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.error || payload.msg || `Bmob 请求失败 (${response.status})`);
      }

      if (payload && payload.error) {
        throw new Error(payload.error);
      }

      return payload;
    }

    return {
      async registerUser(username, password) {
        return request('/users', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
      },
      async loginUser(username, password) {
        const query = new URLSearchParams({ username, password }).toString();
        return request(`/login?${query}`, { method: 'GET' });
      },
      async fetchScores(session) {
        const where = encodeURIComponent(JSON.stringify({ userObjectId: session.objectId }));
        const payload = await request(
          `/classes/${SCORE_CLASS_NAME}?where=${where}&limit=1000`,
          { method: 'GET' },
          session.sessionToken,
        );
        return Array.isArray(payload.results) ? payload.results.map(normalizeScoreRecord) : [];
      },
      async fetchUserBestScore(session) {
        const where = encodeURIComponent(JSON.stringify({ userObjectId: session.objectId }));
        try {
          const payload = await request(
            `/classes/${USER_BEST_SCORE_CLASS_NAME}?where=${where}&limit=1`,
            { method: 'GET' },
            session.sessionToken,
          );
          const rows = Array.isArray(payload.results) ? payload.results.map(normalizeBestScoreRecord) : [];
          return rows[0] || null;
        } catch (error) {
          if (isMissingClassError(error, USER_BEST_SCORE_CLASS_NAME)) {
            return null;
          }
          throw error;
        }
      },
      async fetchLeaderboard() {
        try {
          const payload = await request(
            `/classes/${USER_BEST_SCORE_CLASS_NAME}?order=bestElapsedMs&limit=20`,
            { method: 'GET' },
          );
          return Array.isArray(payload.results) ? payload.results.map(normalizeBestScoreRecord) : [];
        } catch (error) {
          if (isMissingClassError(error, USER_BEST_SCORE_CLASS_NAME)) {
            return [];
          }
          throw error;
        }
      },
      async createScore(session, scorePayload) {
        return request(
          `/classes/${SCORE_CLASS_NAME}`,
          {
            method: 'POST',
            body: JSON.stringify(scorePayload),
          },
          session.sessionToken,
        );
      },
      async deleteScore(session, objectId) {
        return request(
          `/classes/${SCORE_CLASS_NAME}/${objectId}`,
          { method: 'DELETE' },
          session.sessionToken,
        );
      },
      async createBestScore(session, bestScorePayload) {
        return request(
          `/classes/${USER_BEST_SCORE_CLASS_NAME}`,
          {
            method: 'POST',
            body: JSON.stringify(bestScorePayload),
          },
          session.sessionToken,
        );
      },
      async updateBestScore(session, objectId, bestScorePayload) {
        return request(
          `/classes/${USER_BEST_SCORE_CLASS_NAME}/${objectId}`,
          {
            method: 'PUT',
            body: JSON.stringify(bestScorePayload),
          },
          session.sessionToken,
        );
      },
      async deleteBestScore(session, objectId) {
        return request(
          `/classes/${USER_BEST_SCORE_CLASS_NAME}/${objectId}`,
          { method: 'DELETE' },
          session.sessionToken,
        );
      },
      async fetchNumberMemoryRecords(session) {
        const where = encodeURIComponent(JSON.stringify({ userObjectId: session.objectId }));
        try {
          const payload = await request(
            `/classes/${NUMBER_MEMORY_RECORD_CLASS_NAME}?where=${where}&limit=1000`,
            { method: 'GET' },
            session.sessionToken,
          );
          return Array.isArray(payload.results) ? payload.results.map(normalizeNumberMemoryRecord) : [];
        } catch (error) {
          if (isMissingClassError(error, NUMBER_MEMORY_RECORD_CLASS_NAME)) {
            return [];
          }
          throw error;
        }
      },
      async fetchNumberMemoryBest(session) {
        const where = encodeURIComponent(JSON.stringify({ userObjectId: session.objectId }));
        try {
          const payload = await request(
            `/classes/${NUMBER_MEMORY_BEST_CLASS_NAME}?where=${where}&limit=1`,
            { method: 'GET' },
            session.sessionToken,
          );
          const rows = Array.isArray(payload.results) ? payload.results.map(normalizeNumberMemoryBestRecord) : [];
          return rows[0] || null;
        } catch (error) {
          if (isMissingClassError(error, NUMBER_MEMORY_BEST_CLASS_NAME)) {
            return null;
          }
          throw error;
        }
      },
      async fetchNumberMemoryLeaderboard() {
        try {
          const payload = await request(
            `/classes/${NUMBER_MEMORY_BEST_CLASS_NAME}?order=-bestSuccessLength&limit=20`,
            { method: 'GET' },
          );
          return Array.isArray(payload.results) ? payload.results.map(normalizeNumberMemoryBestRecord) : [];
        } catch (error) {
          if (isMissingClassError(error, NUMBER_MEMORY_BEST_CLASS_NAME)) {
            return [];
          }
          throw error;
        }
      },
      async createNumberMemoryRecord(session, payload) {
        return request(
          `/classes/${NUMBER_MEMORY_RECORD_CLASS_NAME}`,
          { method: 'POST', body: JSON.stringify(payload) },
          session.sessionToken,
        );
      },
      async createNumberMemoryBest(session, payload) {
        return request(
          `/classes/${NUMBER_MEMORY_BEST_CLASS_NAME}`,
          { method: 'POST', body: JSON.stringify(payload) },
          session.sessionToken,
        );
      },
      async updateNumberMemoryBest(session, objectId, payload) {
        return request(
          `/classes/${NUMBER_MEMORY_BEST_CLASS_NAME}/${objectId}`,
          { method: 'PUT', body: JSON.stringify(payload) },
          session.sessionToken,
        );
      },
      async deleteNumberMemoryRecord(session, objectId) {
        return request(
          `/classes/${NUMBER_MEMORY_RECORD_CLASS_NAME}/${objectId}`,
          { method: 'DELETE' },
          session.sessionToken,
        );
      },
      async deleteNumberMemoryBest(session, objectId) {
        return request(
          `/classes/${NUMBER_MEMORY_BEST_CLASS_NAME}/${objectId}`,
          { method: 'DELETE' },
          session.sessionToken,
        );
      },
    };
  }

  async function registerUser(api, username, password) {
    const validation = validateCredentials(username, password);
    if (!validation.ok) {
      return validation;
    }

    try {
      const user = normalizeSession(
        await api.registerUser(validation.username, validation.password),
        validation.username,
      );
      if (!user) {
        return { ok: false, message: '注册返回的数据无效' };
      }
      return { ok: true, message: '注册成功', user };
    } catch (error) {
      return { ok: false, message: extractErrorMessage(error, '注册失败') };
    }
  }

  async function loginUser(api, username, password) {
    const validation = validateCredentials(username, password);
    if (!validation.ok) {
      return validation;
    }

    try {
      const user = normalizeSession(await api.loginUser(validation.username, validation.password));
      if (!user) {
        return { ok: false, message: '登录返回的数据无效' };
      }
      return { ok: true, message: '登录成功', user };
    } catch (error) {
      return { ok: false, message: extractErrorMessage(error, '登录失败') };
    }
  }

  function updateStatus() {
    if (!timerElement || !messageElement) {
      return;
    }

    if (targetElement) {
      targetElement.textContent = currentState.completed ? '完成' : String(currentState.nextTarget);
    }

    if (!currentState.running && !currentState.completed) {
      timerElement.textContent = '00.00s';
      messageElement.textContent = currentSession ? '点击“开始训练”开始一局新的舒尔特表挑战。' : '请先注册或登录，再开始训练。';
      return;
    }

    if (currentState.running) {
      messageElement.textContent = '请按顺序点击数字。';
      return;
    }

    messageElement.textContent = '太棒了，这一轮已经完成。';
  }

  function renderGrid(activeCell) {
    if (!gridElement) {
      return;
    }

    gridElement.className = `schulte-grid ${currentState.completed ? 'completed' : currentState.running ? 'active' : 'idle'}`;
    gridElement.innerHTML = '';

    currentState.numbers.forEach((number, index) => {
      const button = document.createElement('button');
      const inkIndex = currentState.colorIndexes[index];
      button.type = 'button';
      button.className = `cell${inkIndex >= 0 ? ` ink-${inkIndex}` : ''}`;
      button.textContent = String(number);
      button.dataset.number = String(number);

      if (currentState.clearedNumbers.includes(number)) {
        button.classList.add('cleared');
        button.disabled = true;
      }

      if (activeCell && activeCell.number === number) {
        button.classList.add(activeCell.status === 'wrong' ? 'wrong-hit' : 'correct-hit');
      }

      button.addEventListener('click', () => {
        void handleCellClick(number, button);
      });
      gridElement.appendChild(button);
    });
  }

  function renderRecords() {
    if (!bestRecordValue || !recordsList || !recordsEmpty) {
      return;
    }

    bestRecordValue.textContent = currentSummary.best ? formatElapsedTime(currentSummary.best.elapsedMs) : '暂无';
    recordsList.innerHTML = '';

    if (!currentSession) {
      recordsEmpty.classList.remove('hidden');
      recordsEmpty.textContent = '请先登录后查看个人成绩。';
      return;
    }

    if (!currentSummary.recent.length) {
      recordsEmpty.classList.remove('hidden');
      recordsEmpty.textContent = '还没有历史成绩，开始训练吧。';
      return;
    }

    recordsEmpty.classList.add('hidden');
    currentSummary.recent.forEach((item) => {
      const row = document.createElement('li');
      const time = document.createElement('span');
      const date = document.createElement('span');
      time.className = 'record-time';
      date.className = 'record-date';
      time.textContent = formatElapsedTime(item.elapsedMs);
      date.textContent = item.completedAt;
      row.appendChild(time);
      row.appendChild(date);
      recordsList.appendChild(row);
    });
  }

  function renderLeaderboard() {
    if (!leaderboardEmpty || !leaderboardList) {
      return;
    }

    leaderboardList.innerHTML = '';

    if (!currentLeaderboard.length) {
      leaderboardEmpty.classList.remove('hidden');
      leaderboardEmpty.textContent = leaderboardMessage;
      return;
    }

    leaderboardEmpty.classList.add('hidden');
    currentLeaderboard.forEach((item, index) => {
      const row = document.createElement('li');
      const rank = document.createElement('span');
      const main = document.createElement('div');
      const user = document.createElement('span');
      const meta = document.createElement('span');
      const score = document.createElement('span');

      row.className = 'leaderboard-row';
      if (currentSession && item.userObjectId === currentSession.objectId) {
        row.classList.add('current-user');
      }

      rank.className = 'leaderboard-rank';
      rank.textContent = String(index + 1);

      main.className = 'leaderboard-main';
      user.className = 'leaderboard-user';
      user.textContent = item.username;
      meta.className = 'leaderboard-meta';
      meta.textContent = item.bestCompletedAt;
      main.appendChild(user);
      main.appendChild(meta);

      score.className = 'leaderboard-score';
      score.textContent = formatElapsedTime(item.bestElapsedMs);

      row.appendChild(rank);
      row.appendChild(main);
      row.appendChild(score);
      leaderboardList.appendChild(row);
    });
  }

  function renderSharePreview() {
    if (!sharePreviewCard || !sharePreviewText) {
      return;
    }

    if (!currentSharePayload) {
      sharePreviewCard.classList.add('hidden');
      sharePreviewText.textContent = '';
      return;
    }

    const modeLabel = currentSharePayload.mode === 'color' ? '彩色模式' : '纯色模式';
    sharePreviewCard.classList.remove('hidden');
    sharePreviewText.textContent = `${currentSharePayload.username} 的最佳成绩是 ${currentSharePayload.bestTime}，完成于 ${currentSharePayload.completedAt}，训练模式为 ${modeLabel}。`;
  }

  function syncModeVisibility() {
    if (schulteModePanel) {
      schulteModePanel.classList.toggle('hidden', activeMode !== 'schulte');
    }
    if (numberMemoryModePanel) {
      numberMemoryModePanel.classList.toggle('hidden', activeMode !== 'memory');
    }
    if (schulteModeButton) {
      schulteModeButton.classList.toggle('active', activeMode === 'schulte');
    }
    if (numberMemoryModeButton) {
      numberMemoryModeButton.classList.toggle('active', activeMode === 'memory');
    }
  }

  function renderNumberMemoryRecords() {
    if (!memoryBestValue || !memoryRecordsList || !memoryRecordsEmpty) {
      return;
    }

    memoryBestValue.textContent = memorySummary.best ? `${memorySummary.best.bestSuccessLength} 位` : '暂无';
    memoryRecordsList.innerHTML = '';

    if (!currentSession) {
      memoryRecordsEmpty.classList.remove('hidden');
      memoryRecordsEmpty.textContent = '请先登录后查看数字记忆成绩。';
      return;
    }

    if (!memorySummary.recent.length) {
      memoryRecordsEmpty.classList.remove('hidden');
      memoryRecordsEmpty.textContent = '还没有数字记忆成绩，开始挑战吧。';
      return;
    }

    memoryRecordsEmpty.classList.add('hidden');
    memorySummary.recent.forEach((item) => {
      const row = document.createElement('li');
      const score = document.createElement('span');
      const date = document.createElement('span');
      score.className = 'record-time';
      date.className = 'record-date';
      score.textContent = `${item.bestSuccessLength} 位`;
      date.textContent = item.completedAt;
      row.appendChild(score);
      row.appendChild(date);
      memoryRecordsList.appendChild(row);
    });
  }

  function renderNumberMemoryLeaderboard() {
    if (!memoryLeaderboardEmpty || !memoryLeaderboardList) {
      return;
    }

    memoryLeaderboardList.innerHTML = '';

    if (!memoryLeaderboard.length) {
      memoryLeaderboardEmpty.classList.remove('hidden');
      memoryLeaderboardEmpty.textContent = memoryLeaderboardMessage;
      return;
    }

    memoryLeaderboardEmpty.classList.add('hidden');
    memoryLeaderboard.forEach((item, index) => {
      const row = document.createElement('li');
      const rank = document.createElement('span');
      const main = document.createElement('div');
      const user = document.createElement('span');
      const meta = document.createElement('span');
      const score = document.createElement('span');

      row.className = 'leaderboard-row';
      if (currentSession && item.userObjectId === currentSession.objectId) {
        row.classList.add('current-user');
      }

      rank.className = 'leaderboard-rank';
      rank.textContent = String(index + 1);
      main.className = 'leaderboard-main';
      user.className = 'leaderboard-user';
      user.textContent = item.username;
      meta.className = 'leaderboard-meta';
      meta.textContent = item.bestCompletedAt;
      score.className = 'leaderboard-score';
      score.textContent = `${item.bestSuccessLength} 位`;

      main.appendChild(user);
      main.appendChild(meta);
      row.appendChild(rank);
      row.appendChild(main);
      row.appendChild(score);
      memoryLeaderboardList.appendChild(row);
    });
  }

  function updateNumberMemoryUI(message) {
    if (memoryCurrentLengthValue) {
      memoryCurrentLengthValue.textContent = String(numberMemoryState.currentLength);
    }
    if (memoryRunBestValue) {
      memoryRunBestValue.textContent = String(numberMemoryState.longestSuccessLength);
    }
    if (memoryMessage) {
      memoryMessage.textContent = message || (currentSession ? '设置起始长度后开始数字记忆训练。' : '请先登录后再开始数字记忆训练。');
    }
    if (memorySequenceDisplay) {
      if (numberMemoryState.status === 'showing') {
        memorySequenceDisplay.textContent = numberMemoryState.currentSequence;
      } else if (numberMemoryState.status === 'answering') {
        memorySequenceDisplay.textContent = '请输入答案';
      } else if (numberMemoryState.status === 'finished') {
        memorySequenceDisplay.textContent = '本轮结束';
      } else {
        memorySequenceDisplay.textContent = '准备开始';
      }
      memorySequenceDisplay.classList.toggle('hidden-sequence', numberMemoryState.status !== 'showing');
    }
    if (memoryAnswerInput) {
      memoryAnswerInput.disabled = !numberMemoryState.awaitingInput;
    }
    if (memorySubmitButton) {
      memorySubmitButton.disabled = !numberMemoryState.awaitingInput;
    }
    if (memoryStartButton) {
      memoryStartButton.disabled = !currentSession;
    }
    if (clearMemoryRecordsButton) {
      clearMemoryRecordsButton.disabled = !currentSession;
    }
    renderNumberMemoryRecords();
    renderNumberMemoryLeaderboard();
  }

  function getBestSharePayload() {
    if (!currentSession || !currentSummary.best) {
      return null;
    }

    const payload = {
      username: currentSession.username,
      bestTime: formatElapsedTime(currentSummary.best.elapsedMs),
      completedAt: currentSummary.best.completedAt,
      mode: currentSummary.best.colorMode || 'color',
    };
    payload.url = buildShareUrl(typeof window !== 'undefined' ? window.location.href : 'https://zxy6023.github.io/brain-training/', payload);
    return payload;
  }

  async function copyText(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    throw new Error('当前浏览器不支持自动复制，请手动复制。');
  }

  function updateShareUI(message) {
    const hasBest = Boolean(currentSession && currentSummary.best);

    if (copyShareTextButton) {
      copyShareTextButton.disabled = !hasBest;
    }

    if (copyShareLinkButton) {
      copyShareLinkButton.disabled = !hasBest;
    }

    if (shareMessage) {
      shareMessage.textContent = message || (hasBest ? '一键复制你的最佳成绩分享文本或分享链接。' : '先完成一局训练，再分享你的最佳成绩。');
    }
  }

  function syncColorMode(enabled) {
    if (!root) {
      return;
    }
    root.classList.toggle('plain-on', !enabled);
    root.classList.toggle('plain-off', enabled);
    root.dataset.mode = enabled ? 'color' : 'plain';
  }

  function updateAuthUI(message) {
    if (currentUserValue) {
      currentUserValue.textContent = currentSession ? currentSession.username : '未登录';
    }

    if (authMessage) {
      authMessage.textContent = message || (currentSession ? `已登录，欢迎你 ${currentSession.username}` : '请先注册或登录，再开始训练。');
    }

    if (startButton) {
      startButton.disabled = !currentSession;
    }

    if (clearRecordsButton) {
      clearRecordsButton.disabled = !currentSession;
    }

    if (logoutButton) {
      logoutButton.disabled = !currentSession;
    }

    renderRecords();
    renderLeaderboard();
    renderSharePreview();
    updateShareUI();
    updateNumberMemoryUI();
    syncModeVisibility();
    updateStatus();
  }

  async function refreshScoreSummary() {
    if (!currentSession || !bmobApi) {
      currentSummary = emptySummary();
      renderRecords();
      updateShareUI();
      return;
    }

    try {
      const records = await bmobApi.fetchScores(currentSession);
      currentSummary = summarizeScoreRecords(records);
      renderRecords();
      updateShareUI();
    } catch (error) {
      currentSummary = emptySummary();
      renderRecords();
      updateShareUI();
      if (recordsEmpty) {
        recordsEmpty.classList.remove('hidden');
        recordsEmpty.textContent = extractErrorMessage(error, '云端成绩加载失败');
      }
    }
  }

  async function refreshLeaderboard() {
    if (!bmobApi) {
      currentLeaderboard = [];
      leaderboardMessage = '当前环境不支持排行榜请求。';
      renderLeaderboard();
      return;
    }

    try {
      currentLeaderboard = summarizeLeaderboardRows(await bmobApi.fetchLeaderboard());
      leaderboardMessage = '还没有排行榜数据。';
      renderLeaderboard();
    } catch (error) {
      currentLeaderboard = [];
      leaderboardMessage = extractErrorMessage(error, '排行榜加载失败');
      renderLeaderboard();
    }
  }

  function applyNumberMemoryDefaultStartLength() {
    const nextDefault = getDefaultNumberMemoryStartLength(memorySummary.best ? memorySummary.best.bestSuccessLength : null);
    numberMemoryState.startLength = nextDefault;
    if (memoryStartLengthInput) {
      memoryStartLengthInput.value = String(nextDefault);
    }
    if (numberMemoryState.status === 'idle') {
      numberMemoryState.currentLength = nextDefault;
    }
  }

  async function refreshNumberMemorySummary() {
    if (!currentSession || !bmobApi) {
      memorySummary = emptyNumberMemorySummary();
      applyNumberMemoryDefaultStartLength();
      renderNumberMemoryRecords();
      return;
    }

    try {
      const records = await bmobApi.fetchNumberMemoryRecords(currentSession);
      memorySummary = summarizeNumberMemoryRecords(records);
      applyNumberMemoryDefaultStartLength();
      renderNumberMemoryRecords();
    } catch (error) {
      memorySummary = emptyNumberMemorySummary();
      applyNumberMemoryDefaultStartLength();
      renderNumberMemoryRecords();
      if (memoryRecordsEmpty) {
        memoryRecordsEmpty.classList.remove('hidden');
        memoryRecordsEmpty.textContent = extractErrorMessage(error, '数字记忆成绩加载失败');
      }
    }
  }

  async function refreshNumberMemoryLeaderboard() {
    if (!bmobApi) {
      memoryLeaderboard = [];
      memoryLeaderboardMessage = '当前环境不支持数字记忆排行榜请求。';
      renderNumberMemoryLeaderboard();
      return;
    }

    try {
      memoryLeaderboard = summarizeNumberMemoryLeaderboardRows(await bmobApi.fetchNumberMemoryLeaderboard());
      memoryLeaderboardMessage = '还没有数字记忆排行榜数据。';
      renderNumberMemoryLeaderboard();
    } catch (error) {
      memoryLeaderboard = [];
      memoryLeaderboardMessage = extractErrorMessage(error, '数字记忆排行榜加载失败');
      renderNumberMemoryLeaderboard();
    }
  }

  async function upsertNumberMemoryBest(bestSuccessLength, completedAt) {
    if (!currentSession || !bmobApi || bestSuccessLength <= 0) {
      return;
    }

    const payload = createNumberMemoryBestPayload(currentSession, bestSuccessLength, completedAt);
    const existing = await bmobApi.fetchNumberMemoryBest(currentSession);

    if (!existing) {
      await bmobApi.createNumberMemoryBest(currentSession, payload);
      return;
    }

    if (bestSuccessLength > existing.bestSuccessLength) {
      await bmobApi.updateNumberMemoryBest(currentSession, existing.objectId, payload);
    }
  }

  async function clearNumberMemoryRecords() {
    if (!currentSession || !bmobApi) {
      return;
    }

    const records = await bmobApi.fetchNumberMemoryRecords(currentSession);
    await Promise.all(records.map((item) => bmobApi.deleteNumberMemoryRecord(currentSession, item.objectId)));
    const best = await bmobApi.fetchNumberMemoryBest(currentSession);
    if (best) {
      await bmobApi.deleteNumberMemoryBest(currentSession, best.objectId);
    }
  }

  async function persistNumberMemorySuccess(bestSuccessLength, messagePrefix) {
    if (bestSuccessLength <= 0) {
      return;
    }

    const completedAt = formatCompletedAt(new Date());
    updateNumberMemoryUI(`${messagePrefix}已刷新到 ${bestSuccessLength} 位，记录已更新。`);

    if (!currentSession || !bmobApi) {
      return;
    }

    try {
      await bmobApi.createNumberMemoryRecord(
        currentSession,
        createNumberMemoryRecordPayload(currentSession, numberMemoryState.startLength, bestSuccessLength, completedAt),
      );
      await upsertNumberMemoryBest(bestSuccessLength, completedAt);
      await refreshNumberMemorySummary();
      await refreshNumberMemoryLeaderboard();
    } catch (error) {
      updateNumberMemoryUI(`${messagePrefix}已达到 ${bestSuccessLength} 位，但云端保存失败：${extractErrorMessage(error, '请稍后重试')}`);
    }
  }

  function clearMemoryHideTimer() {
    if (memoryHideTimer) {
      window.clearTimeout(memoryHideTimer);
      memoryHideTimer = null;
    }
  }

  function revealNextMemorySequence() {
    numberMemoryState.status = 'showing';
    numberMemoryState.currentSequence = createNumberMemorySequence(numberMemoryState.currentLength);
    numberMemoryState.awaitingInput = false;
    updateNumberMemoryUI(`记住这串 ${numberMemoryState.currentLength} 位数字。`);

    clearMemoryHideTimer();
    memoryHideTimer = window.setTimeout(() => {
      numberMemoryState.status = 'answering';
      numberMemoryState.awaitingInput = true;
      if (memoryAnswerInput) {
        memoryAnswerInput.value = '';
        memoryAnswerInput.focus();
      }
      updateNumberMemoryUI(`请输入刚才看到的 ${numberMemoryState.currentLength} 位数字。`);
    }, Math.min(3200, 900 + numberMemoryState.currentLength * 250));
  }

  function switchMode(nextMode) {
    if (activeMode === 'memory' && nextMode !== 'memory') {
      clearMemoryHideTimer();
      numberMemoryState.awaitingInput = false;
      numberMemoryState.currentSequence = '';
      numberMemoryState.status = 'idle';
      applyNumberMemoryDefaultStartLength();
    }
    activeMode = nextMode;
    syncModeVisibility();
    if (activeMode === 'memory') {
      updateNumberMemoryUI();
    } else {
      updateAuthUI();
    }
  }

  function startNumberMemoryGame() {
    if (!currentSession) {
      updateNumberMemoryUI('请先登录后再开始数字记忆训练。');
      return;
    }

    const validation = validateNumberMemoryStartLength(memoryStartLengthInput ? memoryStartLengthInput.value : 3);
    if (!validation.ok) {
      updateNumberMemoryUI(validation.message);
      return;
    }
    const startLength = validation.value;
    if (memoryStartLengthInput) {
      memoryStartLengthInput.value = String(startLength);
    }

    clearMemoryHideTimer();
    numberMemoryState = createNumberMemoryState(startLength);
    revealNextMemorySequence();
  }

  async function finishNumberMemoryGame(messagePrefix) {
    clearMemoryHideTimer();
    numberMemoryState.status = 'finished';
    numberMemoryState.awaitingInput = false;
    const finalBest = numberMemoryState.longestSuccessLength;
    numberMemoryState.currentSequence = '';
    if (memoryAnswerInput) {
      memoryAnswerInput.value = '';
    }

    if (finalBest <= 0) {
      updateNumberMemoryUI(`${messagePrefix}本局还没有成功记住任何一轮。`);
      return;
    }
    updateNumberMemoryUI(`${messagePrefix}本局最长成功长度为 ${finalBest} 位。`);
  }

  async function submitNumberMemoryAnswer() {
    if (!numberMemoryState.awaitingInput) {
      return;
    }

    const answer = String(memoryAnswerInput ? memoryAnswerInput.value : '').trim();
    if (!answer) {
      updateNumberMemoryUI('请输入刚才看到的数字。');
      return;
    }

    if (answer === numberMemoryState.currentSequence) {
      numberMemoryState.longestSuccessLength = numberMemoryState.currentLength;
      numberMemoryState.currentLength += 1;
      numberMemoryState.currentSequence = '';
      numberMemoryState.awaitingInput = false;
      await persistNumberMemorySuccess(numberMemoryState.longestSuccessLength, `回答正确，下一轮将挑战 ${numberMemoryState.currentLength} 位数字。`);
      revealNextMemorySequence();
      return;
    }

    await finishNumberMemoryGame(`输入错误。正确答案是 ${numberMemoryState.currentSequence}。`);
  }

  async function upsertBestScore(elapsedMs, completedAt, colorEnabled) {
    if (!currentSession || !bmobApi) {
      return;
    }

    const payload = createBestScorePayload(currentSession, elapsedMs, completedAt, colorEnabled);
    const existing = await bmobApi.fetchUserBestScore(currentSession);

    if (!existing) {
      await bmobApi.createBestScore(currentSession, payload);
      return;
    }

    if (elapsedMs < existing.bestElapsedMs) {
      await bmobApi.updateBestScore(currentSession, existing.objectId, payload);
    }
  }

  async function clearRemoteRecords() {
    if (!currentSession || !bmobApi) {
      return;
    }

    const records = await bmobApi.fetchScores(currentSession);
    await Promise.all(records.map((item) => bmobApi.deleteScore(currentSession, item.objectId)));

    const bestScore = await bmobApi.fetchUserBestScore(currentSession);
    if (bestScore) {
      await bmobApi.deleteBestScore(currentSession, bestScore.objectId);
    }
  }

  function startTimer() {
    stopTimer();
    roundStart = Date.now();
    timerId = window.setInterval(() => {
      if (timerElement) {
        timerElement.textContent = formatElapsedTime(Date.now() - roundStart);
      }
    }, 10);
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function beginRound() {
    if (!currentSession) {
      updateAuthUI('请先登录后再开始训练。');
      return;
    }

    const freshNumbers = shuffleArray(createSequence(25));
    currentState = createGameState(freshNumbers);

    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }

    if (resultText) {
      resultText.textContent = '你已经完成本轮训练。';
    }

    if (timerElement) {
      timerElement.textContent = '00.00s';
    }

    startTimer();
    updateStatus();
    renderGrid();
  }

  function resetRound() {
    stopTimer();
    currentState = createIdleState(shuffleArray(createSequence(25)));
    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }
    updateStatus();
    renderGrid();
  }

  async function completeRound() {
    stopTimer();

    const elapsedMs = Date.now() - roundStart;
    const elapsed = formatElapsedTime(elapsedMs);
    const completedAt = formatCompletedAt(new Date());

    if (timerElement) {
      timerElement.textContent = elapsed;
    }

    if (resultPanel) {
      resultPanel.classList.remove('hidden');
    }

    if (resultText) {
      resultText.textContent = `本轮完成用时 ${elapsed}，继续刷新你的速度吧。`;
    }

    if (!currentSession || !bmobApi) {
      updateStatus();
      return;
    }

    try {
      const colorEnabled = Boolean(colorToggle && colorToggle.checked);
      await bmobApi.createScore(
        currentSession,
        createScorePayload(currentSession, elapsedMs, completedAt, colorEnabled),
      );
      await upsertBestScore(elapsedMs, completedAt, colorEnabled);
      await refreshScoreSummary();
      await refreshLeaderboard();
    } catch (error) {
      if (resultText) {
        resultText.textContent = `本轮完成用时 ${elapsed}，但云端保存失败：${extractErrorMessage(error, '请稍后重试')}`;
      }
    }

    updateStatus();
  }

  async function handleCellClick(number, button) {
    const result = applyCellSelection(currentState, number);
    currentState = result.state;
    renderGrid({ number, status: result.status });

    if (result.status === 'wrong') {
      if (messageElement) {
        messageElement.textContent = '再找找看，按顺序继续点击。';
      }
      return;
    }

    updateStatus();

    if (result.status === 'completed') {
      await completeRound();
      return;
    }

    if (button) {
      button.blur();
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    if (!bmobApi) {
      updateAuthUI('当前环境不支持网络请求。');
      return;
    }

    const result = await registerUser(
      bmobApi,
      registerUsername ? registerUsername.value : '',
      registerPassword ? registerPassword.value : '',
    );

    if (!result.ok) {
      updateAuthUI(result.message);
      return;
    }

    currentSession = result.user;
    saveSession(currentSession);

    if (registerForm) {
      registerForm.reset();
    }

    if (loginForm) {
      loginForm.reset();
    }

    updateAuthUI('注册并登录成功');
    await refreshScoreSummary();
    await refreshLeaderboard();
    await refreshNumberMemorySummary();
    await refreshNumberMemoryLeaderboard();
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!bmobApi) {
      updateAuthUI('当前环境不支持网络请求。');
      return;
    }

    const result = await loginUser(
      bmobApi,
      loginUsername ? loginUsername.value : '',
      loginPassword ? loginPassword.value : '',
    );

    if (!result.ok) {
      updateAuthUI(result.message);
      return;
    }

    currentSession = result.user;
    saveSession(currentSession);

    if (loginForm) {
      loginForm.reset();
    }

    updateAuthUI('登录成功');
    await refreshScoreSummary();
    await refreshLeaderboard();
    await refreshNumberMemorySummary();
    await refreshNumberMemoryLeaderboard();
  }

  function handleLogoutClick() {
    clearMemoryHideTimer();
    numberMemoryState = createNumberMemoryState(getDefaultNumberMemoryStartLength(memorySummary.best ? memorySummary.best.bestSuccessLength : null));
    currentSession = null;
    currentSummary = emptySummary();
    memorySummary = emptyNumberMemorySummary();
    clearSession();
    updateAuthUI('已退出登录');
    void refreshLeaderboard();
    void refreshNumberMemoryLeaderboard();
  }

  async function handleClearRecordsClick() {
    if (!currentSession || !bmobApi) {
      return;
    }

    try {
      await clearRemoteRecords();
      currentSummary = emptySummary();
      renderRecords();
      await refreshLeaderboard();
      updateAuthUI('已清空当前用户的云端成绩');
    } catch (error) {
      updateAuthUI(extractErrorMessage(error, '清空成绩失败'));
    }
  }

  async function handleClearMemoryRecordsClick() {
    if (!currentSession || !bmobApi) {
      return;
    }

    try {
      await clearNumberMemoryRecords();
      memorySummary = emptyNumberMemorySummary();
      applyNumberMemoryDefaultStartLength();
      renderNumberMemoryRecords();
      await refreshNumberMemoryLeaderboard();
      updateNumberMemoryUI('已清空当前用户的数字记忆成绩');
    } catch (error) {
      updateNumberMemoryUI(extractErrorMessage(error, '清空数字记忆成绩失败'));
    }
  }

  async function handleCopyShareText() {
    const payload = getBestSharePayload();
    if (!payload) {
      updateShareUI('先完成一局训练，再分享你的最佳成绩。');
      return;
    }

    try {
      await copyText(buildShareText(payload));
      updateShareUI('分享文本已复制。');
    } catch (error) {
      updateShareUI(extractErrorMessage(error, '复制分享文本失败'));
    }
  }

  async function handleCopyShareLink() {
    const payload = getBestSharePayload();
    if (!payload) {
      updateShareUI('先完成一局训练，再分享你的最佳成绩。');
      return;
    }

    try {
      await copyText(payload.url);
      updateShareUI('分享链接已复制。');
    } catch (error) {
      updateShareUI(extractErrorMessage(error, '复制分享链接失败'));
    }
  }

  function initBrowserApp() {
    if (!root || !gridElement) {
      return;
    }

    syncColorMode(Boolean(colorToggle && colorToggle.checked));
    applyNumberMemoryDefaultStartLength();
    updateAuthUI();
    renderGrid();

    if (startButton) {
      startButton.addEventListener('click', beginRound);
    }

    if (resetButton) {
      resetButton.addEventListener('click', resetRound);
    }

    if (colorToggle) {
      colorToggle.addEventListener('change', (event) => {
        syncColorMode(event.target.checked);
        renderGrid();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        void handleRegisterSubmit(event);
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        void handleLoginSubmit(event);
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogoutClick);
    }

    if (clearRecordsButton) {
      clearRecordsButton.addEventListener('click', () => {
        void handleClearRecordsClick();
      });
    }

    if (copyShareTextButton) {
      copyShareTextButton.addEventListener('click', () => {
        void handleCopyShareText();
      });
    }

    if (copyShareLinkButton) {
      copyShareLinkButton.addEventListener('click', () => {
        void handleCopyShareLink();
      });
    }

    if (schulteModeButton) {
      schulteModeButton.addEventListener('click', () => switchMode('schulte'));
    }

    if (numberMemoryModeButton) {
      numberMemoryModeButton.addEventListener('click', () => switchMode('memory'));
    }

    if (memoryStartButton) {
      memoryStartButton.addEventListener('click', startNumberMemoryGame);
    }

    if (memorySubmitButton) {
      memorySubmitButton.addEventListener('click', () => {
        void submitNumberMemoryAnswer();
      });
    }

    if (memoryAnswerInput) {
      memoryAnswerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          void submitNumberMemoryAnswer();
        }
      });
    }

    if (clearMemoryRecordsButton) {
      clearMemoryRecordsButton.addEventListener('click', () => {
        void handleClearMemoryRecordsClick();
      });
    }

    void refreshScoreSummary();
    void refreshLeaderboard();
    void refreshNumberMemorySummary();
    void refreshNumberMemoryLeaderboard();
    renderSharePreview();
    updateNumberMemoryUI();
  }

  if (typeof document !== 'undefined') {
    initBrowserApp();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      BMOB_BASE_URL,
      createSequence,
      shuffleArray,
      formatElapsedTime,
      buildTextColorIndex,
      buildBoardState,
      createGameState,
      applyCellSelection,
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
      sanitizeNumberMemoryStartLength,
      validateNumberMemoryStartLength,
      getDefaultNumberMemoryStartLength,
      createNumberMemorySequence,
      summarizeNumberMemoryLeaderboardRows,
    };
  }
}());
