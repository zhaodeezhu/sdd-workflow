'use strict';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';
const BOLD = '\x1b[1m';

function formatMsg(prefix, color, ...args) {
  const text = args.join(' ');
  if (process.stdout.isTTY) {
    return `${color}${BOLD}${prefix}${RESET} ${text}`;
  }
  return `${prefix} ${text}`;
}

function success(...args) {
  console.log(formatMsg('OK', GREEN, ...args));
}

function error(...args) {
  console.error(formatMsg('ERROR', RED, ...args));
}

function warn(...args) {
  console.log(formatMsg('WARNING', YELLOW, ...args));
}

function info(...args) {
  console.log(...args);
}

function step(num, ...args) {
  console.log(formatMsg(`[${num}]`, CYAN, ...args));
}

function dim(...args) {
  const text = args.join(' ');
  if (process.stdout.isTTY) {
    console.log(`${GRAY}${text}${RESET}`);
  } else {
    console.log(text);
  }
}

function header(title) {
  console.log('');
  console.log(`━━━ ${title} ━━━`);
  console.log('');
}

function table(rows, columns) {
  if (!rows.length) return;

  const widths = columns.map((col, i) => {
    const headerLen = col.label.length;
    const maxDataLen = Math.max(...rows.map(r => String(r[col.key] || '').length));
    return Math.min(Math.max(headerLen, maxDataLen), 40);
  });

  const headerLine = columns.map((col, i) => pad(col.label, widths[i])).join('  ');
  const separator = widths.map(w => '─'.repeat(w)).join('──');

  console.log(headerLine);
  console.log(separator);

  for (const row of rows) {
    const line = columns.map((col, i) => pad(String(row[col.key] || ''), widths[i])).join('  ');
    console.log(line);
  }
}

function pad(str, len) {
  const s = str.length > len ? str.slice(0, len - 1) + '…' : str;
  return s + ' '.repeat(Math.max(0, len - s.length));
}

module.exports = { success, error, warn, info, step, dim, header, table };
