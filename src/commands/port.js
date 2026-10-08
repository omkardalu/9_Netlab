import net from 'node:net';
import { emit } from '../lib/format.js';

function checkPort(host, port, timeout = 3000) {
  const portNumber = Number(port);

  if (!host) {
    throw new Error('missing host');
  }

  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
    throw new Error(`invalid port: ${port}`);
  }

  return new Promise((resolve) => {
    const started = Date.now();
    const socket = net.createConnection({ host, port: portNumber });
    let finished = false;

    function finish(open, error) {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve({
        host,
        port: portNumber,
        open,
        timeMs: Date.now() - started,
        ...(error ? { error } : {}),
      });
    }

    socket.setTimeout(timeout);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false, 'timeout'));
    socket.once('error', (error) => finish(false, error.code ?? error.message));
  });
}

export default {
  name: 'port',
  summary: 'Check whether a TCP port is open on a host',
  usage: 'netlab port <host> <port> [--timeout ms]',
  options: {
    timeout: { type: 'string', short: 't', default: '3000' },
  },
  async run({ values, positionals }) {
    const host = positionals[0];
    const port = positionals[1];
    const timeout = Number.parseInt(values.timeout ?? '3000', 10) || 3000;
    const result = await checkPort(host, port, timeout);

    emit(values, result, (data) =>
      `${data.host}:${data.port} is ${data.open ? 'open' : 'closed'}${data.error ? ` (${data.error})` : ''}${data.timeMs ? ` in ${data.timeMs} ms` : ''}`,
    );

    return result;
  },
};