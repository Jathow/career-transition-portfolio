/*
  Simple in-memory login lockout utility. For production, prefer Redis.
*/

type LockRecord = {
  attemptCount: number;
  firstAttemptAtMs: number;
  lockUntilMs?: number;
};

const attemptsByKey: Map<string, LockRecord> = new Map();

const now = () => Date.now();

const getConfig = () => {
  const MAX_ATTEMPTS = Number(process.env.AUTH_LOCKOUT_MAX_ATTEMPTS || 5);
  const WINDOW_MS = Number(process.env.AUTH_LOCKOUT_WINDOW_MS || 15 * 60 * 1000);
  const LOCKOUT_MS = Number(process.env.AUTH_LOCKOUT_DURATION_MS || 10 * 60 * 1000);
  return { MAX_ATTEMPTS, WINDOW_MS, LOCKOUT_MS };
};

const buildKey = (email: string, ip?: string | null) => {
  const safeEmail = (email || '').toLowerCase().trim();
  const safeIp = (ip || '').toString();
  return `${safeEmail}::${safeIp}`;
};

export const isLockedOut = (email: string, ip?: string | null) => {
  const key = buildKey(email, ip);
  const record = attemptsByKey.get(key);
  if (!record) return { locked: false, remainingMs: 0 };
  if (record.lockUntilMs && record.lockUntilMs > now()) {
    return { locked: true, remainingMs: record.lockUntilMs - now() };
  }
  return { locked: false, remainingMs: 0 };
};

export const recordFailure = (email: string, ip?: string | null) => {
  const key = buildKey(email, ip);
  const { MAX_ATTEMPTS, WINDOW_MS, LOCKOUT_MS } = getConfig();
  const existing = attemptsByKey.get(key);
  const t = now();
  if (!existing) {
    attemptsByKey.set(key, { attemptCount: 1, firstAttemptAtMs: t });
    return attemptsByKey.get(key)!;
  }
  // Reset window if outside
  if (t - existing.firstAttemptAtMs > WINDOW_MS) {
    existing.attemptCount = 1;
    existing.firstAttemptAtMs = t;
    existing.lockUntilMs = undefined;
  } else {
    existing.attemptCount += 1;
    if (existing.attemptCount >= MAX_ATTEMPTS) {
      existing.lockUntilMs = t + LOCKOUT_MS;
    }
  }
  attemptsByKey.set(key, existing);
  return existing;
};

export const clearFailures = (email: string, ip?: string | null) => {
  const key = buildKey(email, ip);
  attemptsByKey.delete(key);
};


