import { emit, keyValues, table } from '../lib/format.js';

export default {
  name: 'ip',
  summary: 'Show public IP, private IPs and network interfaces',
  usage: 'netlab ip [--json]',
  options: {},
  async run({ values }) {
    const data = {
      public: '203.0.113.7',
      interfaces: [
        { name: 'eth0', address: '192.168.1.20', family: 'IPv4' },
        { name: 'lo', address: '127.0.0.1', family: 'IPv4' },
      ],
    };

    emit(values, data, (d) =>
      [
        keyValues({ 'Public IP': d.public }),
        '',
        table(d.interfaces, [
          { key: 'name', label: 'Interface' },
          { key: 'address', label: 'Address' },
          { key: 'family', label: 'Family' },
        ]),
      ].join('\n'),
    );
  },
};