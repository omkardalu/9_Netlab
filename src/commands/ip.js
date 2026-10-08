import { emit, keyValues, table } from '../lib/format.js';
import os from 'node:os';


export default {
  name: 'ip',
  summary: 'Show public IP, private IPs and network interfaces',
  usage: 'netlab ip [--json]',
  options: {},
  async run({ values }) {
    const interfaces = os.networkInterfaces();
    
    const ips = Object.values(interfaces)
      .flat()
      .filter(i => i && i.family === 'IPv4' && !i.internal)
      .map(i => i.address);
    
    const data = {
      public: 'Unavaibale',
      interfaces: [
        { name: 'eth0', address: ips, family: 'IPv4' },
        // { name: 'lo', address: '127.0.0.1', family: 'IPv4' },
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