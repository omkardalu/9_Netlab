import { Resolver } from 'node:dns/promises';
import { emit, table } from '../lib/format.js';

async function query(domain, server = 'system') {
  const resolver = new Resolver();

  if (server !== 'system') resolver.setServers([server]);

  async function noDataAsEmpty(promise) {
    try {
      return await promise;
    } catch (error) {
      if (error.code === 'ENODATA') return [];
      throw error;
    }
  }

  const [a, cname, mx] = await Promise.all([
    noDataAsEmpty(resolver.resolve4(domain, { ttl: true })),
    noDataAsEmpty(resolver.resolveCname(domain)),
    noDataAsEmpty(resolver.resolveMx(domain)),
  ]);

  return {
    domain,
    server,
    records: {
      A: a.map(({ address, ttl }) => ({ address, ttl })),
      CNAME: cname,
      MX: mx.map(({ priority, exchange }) => ({ priority, exchange })),
    },
  };
}

export default {
  name: 'dns',
  summary: 'Look up DNS records (A, CNAME, MX) for a domain',
  usage: 'netlab dns <domain> [--type A|CNAME|MX]',
  options: {
    type: { type: 'string', short: 't', default: 'A' },
  },
  async run({ values, positionals }) {
    const domain = positionals[0];
    const type = (values.type ?? 'A').toUpperCase();
    const result = await query(domain);

    if (values.json) {
      const filtered = {
        ...result,
        type,
        records: { [type]: result.records[type] ?? [] },
      };
      emit(values, filtered, (data) => JSON.stringify(data, null, 2));
      return filtered;
    }

    const selected = result.records[type] ?? [];
    const label = type === 'MX' ? 'MX' : type;

    if (type === 'A') {
      console.log(`
${result.domain} (resolver: system default)

${label}
${table(selected, [
  { key: 'address', label: 'Address' },
  { key: 'ttl', label: 'TTL', align: 'right' },
])}
`);
      return result;
    }

    console.log(`
${result.domain} (resolver: system default)

${label}
${type === 'MX'
  ? table(selected, [
      { key: 'priority', label: 'Priority', align: 'right' },
      { key: 'exchange', label: 'Exchange' },
    ])
  : selected.join('\n') || 'No records'}
`);

    return result;
  },
};