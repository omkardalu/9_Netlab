export default {
  name: 'port',
  summary: 'Check whether a TCP port is open on a host',
  usage: 'netlab port <host> <port> [--timeout ms]',
  options: {
    timeout: { type: 'string', short: 't', default: '3000' },
  },
  async run({ values, positionals }) {
    console.log('port: not implemented yet', { values, positionals });
  },
};