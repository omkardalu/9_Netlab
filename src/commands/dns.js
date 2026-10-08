export default {
  name: 'dns',
  summary: 'Look up DNS records (A, CNAME, MX) for a domain',
  usage: 'netlab dns <domain> [--type A|CNAME|MX]',
  options: {
    type: { type: 'string', short: 't', default: 'A' },
  },
  async run({ values, positionals }) {
    console.log('dns: not implemented yet', { values, positionals });
  },
};