import { emit, keyValues, table } from '../lib/format.js';
import os from 'node:os';

async function getPublicIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) return 'Unavailable';
    const data = await response.json();
    return data.ip ?? 'Unavailable';
  } catch {
    return 'Unavailable';
  }
}

export default {
  name: 'ip',
  summary: 'Show public IP, private IPs and network interfaces',
  usage: 'netlab ip [--json]',
  options: {},
  async run({ values }) {
    const interfaces = Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) =>
      (addresses ?? []).map((address) => ({
        name,
        address: address.address,
        family: address.family,
        internal: address.internal,
      })),
    );

    const privateIps = [...new Set(
      interfaces
        .filter((entry) => entry.family === 'IPv4' && !entry.internal)
        .map((entry) => entry.address),
    )];

    const data = {
      public: await getPublicIp(),
      private: privateIps,
      interfaces: interfaces
        .filter((entry) => entry.family === 'IPv4' || entry.family === 'IPv6')
        .map((entry) => ({
          name: entry.name,
          address: entry.address,
          family: entry.family,
          internal: entry.internal,
        })),
    };

    emit(values, data, (d) =>
      [
        keyValues({
          'Public IP': d.public,
          'Private IPs': d.private.length ? d.private.join(', ') : 'None',
        }),
        '',
        table(d.interfaces, [
          { key: 'name', label: 'Interface' },
          { key: 'address', label: 'Address' },
          { key: 'family', label: 'Family' },
          { key: 'internal', label: 'Internal' },
        ]),
      ].join('\n'),
    );

    return data;
  },
};