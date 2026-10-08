import dns from './dns.js';
import ip from './ip.js';
import port from './port.js';
import tcping from './tcping.js';

export const commands = new Map(
  [dns, ip, port, tcping].map((cmd) => [cmd.name, cmd]),
);