import { execSync } from 'child_process';

import { message } from 'danger';
import { danger, fail, schedule, warn } from 'danger';

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
  message("We're getting some strict mode magic goin");
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

      let warningMessage = '## 📊 TypeScript Strict Mode Errors\n\n';
      warningMessage += `This PR touches **${relevantErrorCount}** file(s) with strict mode errors `;
      warningMessage += `(${percentageInPR}% of ${result.totalErrors} total project errors).\n\n`;
      warningMessage +=
        'Fixing these would help move the project toward full strict mode compliance!\n\n';

      warningMessage += `<details>\n<summary>View errors by file (${Object.keys(relevantErrors).length} files)</summary>\n\n`;

      for (const [filename, errors] of Object.entries(relevantErrors)) {
        warningMessage += `\n**${filename}** (${errors.length} error${errors.length > 1 ? 's' : ''})\n`;

        const displayErrors = errors.slice(0, 5);
        for (const error of displayErrors) {
          const location = `Line ${error.start.line}:${error.start.character}`;
          warningMessage += `- ${location}: ${error.message.split('\n')[0]}\n`;
        }

        if (errors.length > 5) {
          warningMessage += `- _(${errors.length - 5} more errors in this file)_\n`;
        }
      }

      warningMessage += '\n</details>';

      warn(warningMessage);
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn((error as unknown as any).toString());
    console.error('Error checking strict mode errors:', error);
  }
}

schedule(checkStrictModeErrors());
