import { test } from 'node:test';
import assert from 'node:assert/strict';

// `out` in format.js is decided at import time, so set NO_COLOR first.
// Static imports are hoisted above this line, hence the dynamic import.
process.env.NO_COLOR = '1';
const { table, keyValues, paint } = await import('../src/lib/format.js');

test('table aligns columns and right-aligns numbers', () => {
  const text = table(
    [
      { name: 'alpha', n: 1 },
      { name: 'b', n: 22 },
    ],
    [
      { key: 'name', label: 'Name' },
      { key: 'n', label: 'N', align: 'right' },
    ],
  );
  assert.deepEqual(text.split('\n'), [
    'Name    N',
    '─────  ──',
    'alpha   1',
    'b      22',
  ]);
});

test('keyValues pads keys to the longest one', () => {
  assert.equal(keyValues({ A: '1', Long: '2' }), 'A     1\nLong  2');
});

test('paint emits ANSI codes only for a colour-capable stream', () => {
  const saved = { ...process.env };
  try {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    process.env.TERM = 'xterm';

    assert.equal(paint({ isTTY: true }).red('x'), '\x1b[31mx\x1b[39m');
    assert.equal(paint({ isTTY: false }).red('x'), 'x');

    process.env.NO_COLOR = '1';
    assert.equal(paint({ isTTY: true }).red('x'), 'x');
  } finally {
    process.env = saved;
  }
});