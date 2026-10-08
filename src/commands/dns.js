import { Resolver } from 'node:dns/promises';
import { table } from '../lib/format.js';

async function query(domain, server = 'system') {
  const resolver = new Resolver();

  // Leave default system DNS servers when server is "system".
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
    const result = await query(positionals[0]);
    if(values.json){
      return result;
    }else{
      console.log(`
${result.domain} (resolver: system default)

A
${table(
  result.records.A ,[
  { key: 'address', label: 'Address' },
  { key: 'ttl', label: 'TTL', align: 'right' },
  ]
)}

CNAME
${result.records.CNAME}

MX
${table(
  result.records.MX ,[
{ key: 'priority', label: 'Priority', align: 'right' },
{ key: 'exchange', label: 'Exchange' },
  ]
)}
        `);
      
    }

  },
};