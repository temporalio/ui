import { execSync } from 'child_process';

import { danger, fail, message, warn } from 'danger';

const pr = danger.github.pr;
const modified = danger.git.modified_files;
const created = danger.git.created_files;
const deleted = danger.git.deleted_files;

// Ensure PR has description
if (!pr.body || pr.body.length < 10) {
  fail('Please add a meaningful description to the PR.');
}

// PR size check
const bigPRThreshold = 600;
const totalChanges = modified.length + created.length + deleted.length;
if (totalChanges > bigPRThreshold) {
  warn(
    `This PR has ${totalChanges} changed files. Consider breaking it into smaller PRs for easier review.`,
  );
}

message("Hey we're using a dangerfile");

interface StrictError {
  type: 'ERROR';
  filename: string;
  start: { line: number; character: number };
  end: { line: number; character: number };
  message: string;
  code?: string;
  source?: string;
}

interface StrictErrorResult {
  success: boolean;
  totalErrors: number;
  errorsByFile: Record<string, StrictError[]>;
}

async function checkStrictModeErrors() {
  try {
    const output = execSync('pnpm dlx esno scripts/count-strict-errors.ts', {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 5 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const result: StrictErrorResult = JSON.parse(output);

    if (!result.success) return;

    const changedFiles = new Set([
      ...danger.git.modified_files,
      ...danger.git.created_files,
    ]);

    const relevantErrors: Record<string, StrictError[]> = {};
    let relevantErrorCount = 0;

    for (const [filename, errors] of Object.entries(result.errorsByFile)) {
      const isChanged = Array.from(changedFiles).some(
        (changedFile) =>
          changedFile.includes(filename) || filename.includes(changedFile),
      );

      if (isChanged) {
        relevantErrors[filename] = errors;
        relevantErrorCount += errors.length;
      }
    }

    if (relevantErrorCount > 0) {
      const percentageInPR = (
        (relevantErrorCount / result.totalErrors) *
        100
      ).toFixed(1);

      let message = '## 📊 TypeScript Strict Mode Errors\n\n';
      message += `This PR touches **${relevantErrorCount}** file(s) with strict mode errors `;
      message += `(${percentageInPR}% of ${result.totalErrors} total project errors).\n\n`;
      message +=
        'Fixing these would help move the project toward full strict mode compliance!\n\n';

      message += `<details>\n<summary>View errors by file (${Object.keys(relevantErrors).length} files)</summary>\n\n`;

      for (const [filename, errors] of Object.entries(relevantErrors)) {
        message += `\n**${filename}** (${errors.length} error${errors.length > 1 ? 's' : ''})\n`;

        const displayErrors = errors.slice(0, 5);
        for (const error of displayErrors) {
          const location = `Line ${error.start.line}:${error.start.character}`;
          message += `- ${location}: ${error.message.split('\n')[0]}\n`;
        }

        if (errors.length > 5) {
          message += `- _(${errors.length - 5} more errors in this file)_\n`;
        }
      }

      message += '\n</details>';

      warn(message);
    }
  } catch (error) {
    console.error('Error checking strict mode errors:', error);
  }
}

await checkStrictModeErrors();
