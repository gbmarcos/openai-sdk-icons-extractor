import chalk from 'chalk';

export const log = {
  info: (msg: string): void => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string): void => console.log(chalk.green('✓'), msg),
  error: (msg: string): void => console.error(chalk.red('✖'), msg),
  warn: (msg: string): void => console.warn(chalk.yellow('⚠'), msg)
};

