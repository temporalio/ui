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

    if (!output || output.trim().length === 0) {
      console.error('Script produced no output');
      return;
    }

    const lines = output.trim().split('\n');
    const jsonLine = lines[lines.length - 1];

    let result: StrictErrorResult;
    try {
      result = JSON.parse(jsonLine);
    } catch (parseError) {
      console.error('Failed to parse strict mode check results');
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

    console.log('Changed files in PR:', Array.from(changedFiles));

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

      // Summary warning
      let warningMessage = '## 📊 TypeScript Strict Mode Errors\n\n';
      warningMessage += `This PR touches **${Object.keys(relevantErrors).length}** file(s) with strict mode errors `;
      warningMessage += `(${relevantErrorCount} total errors across these files, `;
      warningMessage += `${percentageInPR}% of ${result.totalErrors} project-wide errors).\n\n`;
      warningMessage +=
        'Fixing these would help move the project toward full strict mode compliance!\n\n';

      warningMessage +=
        '<details>\n<summary>View all errors by file</summary>\n\n';

      for (const [filename, errors] of Object.entries(relevantErrors)) {
        warningMessage += `\n### ${filename}\n`;
        warningMessage += `**${errors.length} error${errors.length > 1 ? 's' : ''}**\n\n`;

        for (const error of errors) {
          const location = `Line ${error.start.line}:${error.start.character}`;
          warningMessage += `- ${location}: ${error.message}\n`;
        }
      }

      warningMessage += '\n</details>';

      warn(warningMessage);

      // Individual warnings for each error - but only for lines in the diff
      for (const [filename, errors] of Object.entries(relevantErrors)) {
        console.log(
          `\n=== Processing ${errors.length} errors for file: ${filename} ===`,
        );

        // Use structuredDiffForFile to get accurate line information
        const structuredDiff = await danger.git.structuredDiffForFile(filename);
        if (!structuredDiff) {
          console.log(
            `  No structured diff found for ${filename}, skipping inline comments`,
          );
          continue;
        }

        // Collect all line numbers that appear in the diff
        const linesInDiff = new Set<number>();
        for (const chunk of structuredDiff.chunks) {
          for (const change of chunk.changes) {
            // For added lines, use ln2 (new file line number)
            // For unchanged context lines, also use ln2
            if (change.type === 'add' && change.ln2) {
              linesInDiff.add(change.ln2);
            } else if (change.type === 'normal' && change.ln2) {
              linesInDiff.add(change.ln2);
            }
          }
        }

        console.log(
          `  Lines in diff: ${Array.from(linesInDiff)
            .sort((a, b) => a - b)
            .join(', ')}`,
        );

        for (const error of errors) {
          if (linesInDiff.has(error.start.line)) {
            console.log(
              `  ✓ warn("${error.message.substring(0, 60)}...", "${filename}", ${error.start.line})`,
            );
            warn(`${error.message}`, filename, error.start.line);
          } else {
            console.log(
              `  ✗ Skipping line ${error.start.line} (not in diff): ${error.message.substring(0, 60)}...`,
            );
          }
        }
      }
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
