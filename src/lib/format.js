const CODES = {
  bold: [1, 22],
  dim: [2, 22],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  cyan: [36, 39],
};

function supportsColor(stream) {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR === '0') return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(stream.isTTY) && process.env.TERM !== 'dumb';
}

// Returns { bold, dim, red, ... } functions bound to one stream's color support.
export function paint(stream = process.stdout) {
  const on = supportsColor(stream);
  return Object.fromEntries(
    Object.entries(CODES).map(([name, [open, close]]) => [
      name,
      (text) => (on ? `\x1b[${open}m${text}\x1b[${close}m` : String(text)),
    ]),
  );
}

export const out = paint(process.stdout);
export const err = paint(process.stderr);

// columns: [{ key, label, align?: 'left' | 'right' }]
// Pad first, colour after: escape codes would break the width maths.
export function table(rows, columns) {
  const cells = rows.map((row) => columns.map((c) => String(row[c.key] ?? '')));
  const widths = columns.map((c, i) =>
    Math.max(c.label.length, ...cells.map((row) => row[i].length)),
  );
  const pad = (text, i) =>
    columns[i].align === 'right' ? text.padStart(widths[i]) : text.padEnd(widths[i]);

  const header = columns.map((c, i) => out.bold(pad(c.label, i))).join('  ');
  const rule = out.dim(widths.map((w) => '─'.repeat(w)).join('  '));
  const body = cells.map((row) => row.map(pad).join('  '));

  return [header, rule, ...body].join('\n');
}

// Aligned "key   value" lines, e.g. for `netlab ip`.
export function keyValues(pairs) {
  const entries = Object.entries(pairs);
  const width = Math.max(...entries.map(([k]) => k.length));
  return entries
    .map(([k, v]) => `${out.dim(k.padEnd(width))}  ${v}`)
    .join('\n');
}

// One place decides JSON vs human output.
export function emit(values, data, render) {
  console.log(values.json ? JSON.stringify(data, null, 2) : render(data));
}