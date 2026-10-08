import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { commands } from './commands/index.js';
import { CliError, UsageError } from './lib/errors.js';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

function helpText() {
  const width = Math.max(...[...commands.keys()].map((n) => n.length));
  const rows = [...commands.values()]
    .map((c) => `  ${c.name.padEnd(width)}  ${c.summary}`)
    .join('\n');

  return `netlab ${version} - a network explorer CLI

Usage:
  netlab <command> [options]

Commands:
${rows}

Global options:
  -h, --help       Show help ("netlab <command> --help" for a command)
  -v, --version    Show version
`;
}

function commandHelp(cmd) {
  return `${cmd.summary}\n\nUsage:\n  ${cmd.usage}\n`;
}

async function main(argv) {
  const [name, ...rest] = argv;

  if (!name || name === '-h' || name === '--help' || name === 'help') {
    console.log(helpText());
    return;
  }
  if (name === '-v' || name === '--version') {
    console.log(version);
    return;
  }

  const command = commands.get(name);
  if (!command) {
    throw new UsageError(
      `unknown command "${name}"`,
      'Run "netlab --help" to see available commands.',
    );
  }

  let parsed;
  try {
    parsed = parseArgs({
      args: rest,
      options: { help: { type: 'boolean', short: 'h' }, ...command.options },
      allowPositionals: true,
      strict: true,
    });
  } catch (err) {
    throw new UsageError(err.message, `Usage: ${command.usage}`);
  }

  if (parsed.values.help) {
    console.log(commandHelp(command));
    return;
  }

  await command.run(parsed);
}

export async function run(argv) {
  try {
    await main(argv);
  } catch (err) {
    if (err instanceof CliError) {
      console.error(`error: ${err.message}`);
      if (err.hint) console.error(err.hint);
      process.exitCode = err.exitCode;
    } else {
      console.error(`unexpected error: ${err.message}`);
      if (process.env.NETLAB_DEBUG) console.error(err.stack);
      process.exitCode = 1;
    }
  }
}