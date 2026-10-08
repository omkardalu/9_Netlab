import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/netlab.js', import.meta.url));
const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

// Run the real CLI. Colour env vars are stripped so results are deterministic.
function netlab(args, env = {}) {
  const base = { ...process.env };
  delete base.NO_COLOR;
  delete base.FORCE_COLOR;
  const r = spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    env: { ...base, ...env },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

test('no arguments prints help and exits 0', () => {
  const r = netlab([]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /Usage:/);
  assert.match(r.stdout, /Commands:/);
});

test('help lists every registered command', () => {
  const r = netlab(['--help']);
  for (const name of ['dns', 'ip', 'port', 'tcping']) {
    assert.match(r.stdout, new RegExp(`\\b${name}\\b`));
  }
});

test('--version matches package.json', () => {
  const r = netlab(['--version']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout.trim(), version);
});

test('per-command --help shows usage', () => {
  const r = netlab(['dns', '--help']);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /netlab dns/);
});

test('unknown command exits 2, writes to stderr only', () => {
  const r = netlab(['nope']);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /unknown command "nope"/);
  assert.equal(r.stdout, '');
});

test('unknown flag exits 2 with a usage line', () => {
  const r = netlab(['dns', '--bogus']);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /Usage: netlab dns/);
});

test('piped output contains no ANSI escape codes', () => {
  const r = netlab(['ip']);
  assert.doesNotMatch(r.stdout, /\x1b\[/);
});

test('FORCE_COLOR=1 enables colour through a pipe', () => {
  const r = netlab(['ip'], { FORCE_COLOR: '1' });
  assert.match(r.stdout, /\x1b\[/);
});

test('NO_COLOR beats FORCE_COLOR', () => {
  const r = netlab(['ip'], { NO_COLOR: '1', FORCE_COLOR: '1' });
  assert.doesNotMatch(r.stdout, /\x1b\[/);
});