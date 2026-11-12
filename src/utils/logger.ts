/**
 * Simple session logger – stores entries in memory and can export as text
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogEntry = {
  ts: number;
  level: LogLevel;
  msg: string;
  data?: unknown;
};

const SESSION_START = Date.now();
const entries: LogEntry[] = [];

function add(level: LogLevel, msg: string, data?: unknown) {
  entries.push({ ts: Date.now(), level, msg, data });
  if (__DEV__) {
    const elapsed = ((Date.now() - SESSION_START) / 1000).toFixed(1);
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${elapsed}s] [${level.toUpperCase()}] ${msg}`,
      data ?? ''
    );
  }
}

export const logger = {
  debug: (msg: string, data?: unknown) => add('debug', msg, data),
  info: (msg: string, data?: unknown) => add('info', msg, data),
  warn: (msg: string, data?: unknown) => add('warn', msg, data),
  error: (msg: string, data?: unknown) => add('error', msg, data),

  exportText(): string {
    return entries
      .map((e) => {
        const t = new Date(e.ts).toISOString().substring(11, 23);
        const data = e.data ? ` | ${JSON.stringify(e.data)}` : '';
        return `[${t}] ${e.level.toUpperCase().padEnd(5)} ${e.msg}${data}`;
      })
      .join('\n');
  },

  clear() {
    entries.length = 0;
  },

  getEntries(): ReadonlyArray<LogEntry> {
    return entries;
  },
};
