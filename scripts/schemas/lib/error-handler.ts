import chalk from 'chalk';

interface ErrorOptions {
  showCommand?: boolean;
  showStackTrace?: boolean;
  exitProcess?: boolean;
  exitCode?: number;
}

const defaultOptions: ErrorOptions = {
  showCommand: true,
  showStackTrace: false,
  exitProcess: true,
  exitCode: 1,
};

/**
 * Friendly error handler for Bun system calls
 */
export function handleBunError(
  error: unknown,
  message = 'Command execution failed',
  options: ErrorOptions = defaultOptions,
): never {
  const { showCommand, showStackTrace, exitProcess, exitCode } = {
    ...defaultOptions,
    ...options,
  };

  // Clear current line
  process.stdout.write('\r\x1b[K');

  console.error(chalk.red('❌ ERROR: ') + chalk.bold(message));

  if (error instanceof Error) {
    // Check for common error patterns from Bun system calls
    if (error.message.includes('ENOENT')) {
      console.error(
        chalk.yellow('⚠️  A required file was not found. This might mean:'),
      );
      console.error(
        '   - You need to run ' + chalk.cyan('pnpm install') + ' first',
      );
      console.error('   - The file path is incorrect');
    } else if (error.message.includes('Command failed')) {
      if (showCommand && error.message.includes('Command:')) {
        const command = error.message.split('Command:')[1]?.trim();
        if (command) {
          console.error(chalk.yellow('⚠️  The following command failed:'));
          console.error('   ' + chalk.cyan(command));
        }
      }
    } else if (error.message.includes('EACCES')) {
      console.error(chalk.yellow('⚠️  Permission denied. You might need to:'));
      console.error('   - Run with higher permissions');
      console.error('   - Check file/directory permissions');
    } else {
      console.error(chalk.yellow('⚠️  Error details: ') + error.message);
    }

    if (showStackTrace && error.stack) {
      console.error('');
      console.error(chalk.dim('Stack trace:'));
      console.error(chalk.dim(error.stack));
    }
  } else {
    console.error(chalk.yellow('⚠️  Unknown error:'), error);
  }

  console.error('');
  console.error(chalk.blue('💡 Try the following:'));
  console.error(
    '   - Run ' +
      chalk.cyan('pnpm install') +
      ' to ensure dependencies are installed',
  );
  console.error('   - Check that all required files exist');
  console.error(
    '   - Check the error details above for more specific guidance',
  );

  if (exitProcess) {
    process.exit(exitCode);
  }

  throw error;
}
