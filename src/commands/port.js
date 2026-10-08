import net from 'node:net';

function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeout);

    socket.once('connect', () => {
      socket.destroy();
      resolve({ host, port, open: true });
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve({ host, port, open: false, error: 'timeout' });
    });

    socket.once('error', (error) => {
      resolve({ host, port, open: false, error: error.code });
    });
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
    const timeout = 3000;
    const result = await checkPort(host,port,timeout);
    console.log(result);
    return result;
  },
};