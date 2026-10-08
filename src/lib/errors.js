export class CliError extends Error {
  constructor(message, { exitCode = 1, hint } = {}) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
    this.hint = hint;
  }
}

export class UsageError extends CliError {
  constructor(message, hint) {
    super(message, { exitCode: 2, hint });
    this.name = 'UsageError';
  }
}