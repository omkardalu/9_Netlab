import net from 'node:net';
import { performance } from 'node:perf_hooks';
import { emit } from '../lib/format.js';

function tcpingOnce(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const started = performance.now();
    let done = false;

    function finish(result) {
      if (done) return;
      done = true;
      socket.destroy();
      resolve({
        ...result,
        timeMs: Math.round(performance.now() - started),
      });
    }

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish({ success: true }));
    socket.once('timeout', () => finish({ success: false, error: 'timeout' }));
    socket.once('error', (err) =>
      finish({ success: false, error: err.code ?? err.message }),
    );
  });
}

export default {
  name: 'tcping',
  summary: 'Measure TCP connect latency to a host:port',
  usage: 'netlab tcping <host> <port> [--count n] [--timeout ms]',
  options: {
    count: { type: 'string', short: 'c', default: '4' },
    timeout: { type: 'string', short: 't', default: '3000' },
  },
  async run({ values, positionals }) {
    const host = positionals[0];
    const port = Number(positionals[1]);
    const count = Number.parseInt(values.count ?? '4', 10) || 4;
    const timeoutMs = Number.parseInt(values.timeout ?? '3000', 10) || 3000;

    const attempts = [];
    for (let i = 1; i <= count; i += 1) {
      const result = await tcpingOnce(host, port, timeoutMs);
      attempts.push({ attempt: i, ...result });

      if (values.json) {
        continue;
      }

      console.log(
        result.success
          ? `Connected to ${host}:${port} in ${result.timeMs} ms`
          : `Failed to connect to ${host}:${port}: ${result.error}`,
      );
    }

    if (values.json) {
      emit(values, { host, port, count, timeoutMs, attempts }, () => '');
      return { host, port, count, timeoutMs, attempts };
    }

    return attempts;
  },
};
