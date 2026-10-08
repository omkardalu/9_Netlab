export default {
  name: 'tcping',
  summary: 'Measure TCP connect latency to a host:port',
  usage: 'netlab tcping <host> <port> [--count n] [--timeout ms]',
  options: {
    count: { type: 'string', short: 'c', default: '4' },
    timeout: { type: 'string', short: 't', default: '3000' },
  },
  async run({ values, positionals }) {
    console.log('tcping: not implemented yet', { values, positionals });
  },
};