import { execSync } from 'child_process';

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
  filename: string;
  start: { line: number; character: number };
  message: string;
}

interface StrictErrorResult {
  success: boolean;
  totalErrors: number;
  errorsByFile: Record<string, StrictError[]>;
}

async function checkStrictModeErrors() {
  try {
    const tmpFile = `/tmp/strict-errors-${Date.now()}.json`;

    execSync(`pnpm dlx esno scripts/count-strict-errors.ts > ${tmpFile}`, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 5 * 60 * 1000,
      shell: '/bin/bash',
    });

    const fs = await import('fs');
    const output = fs.readFileSync(tmpFile, 'utf8');
    fs.unlinkSync(tmpFile);

    console.log('=== RAW OUTPUT START ===');
    console.log(output);
    console.log('=== RAW OUTPUT END ===');
    console.log(`Output length: ${output.length} bytes`);

    if (!output || output.trim().length === 0) {
      console.error('Script produced no output');
      return;
    }

    // Extract the last line which should be the JSON output
    const lines = output.trim().split('\n');
    console.log(`Total lines: ${lines.length}`);
    const jsonLine = lines[lines.length - 1];
    console.log(`Last line length: ${jsonLine.length} bytes`);

    let result: StrictErrorResult;
    try {
      result = JSON.parse(jsonLine);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON');
      console.error(`Parse error: ${parseError}`);
      console.error(jsonLine);

      warn(
        '⚠️ Failed to parse strict mode check results. Check CI logs for details.',
      );
      return;
    }

    if (!result.success) {
      console.error('Script reported failure');
      return;
    }

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
    console.error('Error checking strict mode errors:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    warn(
      `⚠️ Strict mode check failed: ${errorMessage.split('\n')[0]}. Check CI logs for details.`,
    );
  }
}

schedule(checkStrictModeErrors());
