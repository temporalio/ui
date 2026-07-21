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

// Remind to cut a release when the Temporal API dependency is bumped
async function checkApiVersionBump() {
  if (!modified.includes('server/go.mod')) {
    return;
  }

  const diff = await danger.git.diffForFile('server/go.mod');
  if (diff?.added.includes('go.temporal.io/api')) {
    warn(
      '📦 `go.temporal.io/api` was bumped in `server/go.mod`. ' +
        'Remember to cut a new release after this merges.',
    );
  }
}

schedule(checkApiVersionBump());

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
  const DEBUG = false; // Set to true to enable detailed logging

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
    } catch {
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

    if (DEBUG) {
      console.log('Changed files in PR:', Array.from(changedFiles));
    }

    // Find errors in files that were changed in this PR
    const relevantErrors: Record<string, StrictError[]> = {};
    let relevantErrorCount = 0;

    // svelte-check and Danger both report repo-relative POSIX paths; compare
    // by normalized equality (substring matching both missed regressions and
    // false-blocked unrelated files that share a path suffix).
    const normalizePath = (p: string) => p.replace(/^\.?\//, '');

    for (const [filename, errors] of Object.entries(result.errorsByFile)) {
      const normalizedFilename = normalizePath(filename);
      const isChanged = Array.from(changedFiles).some(
        (changedFile) => normalizePath(changedFile) === normalizedFilename,
      );

      if (isChanged) {
        relevantErrors[filename] = errors;
        relevantErrorCount += errors.length;
      }
    }

    if (relevantErrorCount === 0) {
      return;
    }

    const fileCount = Object.keys(relevantErrors).length;

    // The codebase is strict-clean; any strict error in a changed file is a
    // regression and must block the PR.
    let failureMessage = `❌ **Strict Mode**: ${relevantErrorCount} TypeScript error${relevantErrorCount > 1 ? 's' : ''} in ${fileCount} changed file${fileCount > 1 ? 's' : ''}. Strict mode is enforced — please fix before merging.\n\n`;

    for (const [filename, errors] of Object.entries(relevantErrors)) {
      failureMessage += `<details>\n<summary><strong>${filename}</strong> (${errors.length})</summary>\n\n`;

      for (const error of errors) {
        failureMessage += `- L${error.start.line}:${error.start.character}: ${error.message}\n`;
      }

      failureMessage += '\n</details>\n\n';
    }

    fail(failureMessage);

    // Post individual warnings for errors on lines in the diff
    for (const [filename, errors] of Object.entries(relevantErrors)) {
      if (DEBUG) {
        console.log(`Processing ${errors.length} errors for file: ${filename}`);
      }

      const structuredDiff = await danger.git.structuredDiffForFile(filename);
      if (!structuredDiff) {
        if (DEBUG) {
          console.log(`No structured diff found for ${filename}`);
        }
        continue;
      }

      // Calculate which line numbers exist in the new version of the file
      const linesInDiff = new Set<number>();

      for (const chunk of structuredDiff.chunks) {
        // Parse chunk header: @@ -old_start,old_count +new_start,new_count @@
        const match = chunk.content.match(
          /@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/,
        );
        if (!match) continue;

        let currentNewLine = parseInt(match[1], 10);

        for (const change of chunk.changes) {
          if (change.type === 'add' || change.type === 'normal') {
            linesInDiff.add(currentNewLine);
            currentNewLine++;
          }
          // Deleted lines don't exist in the new file, so skip them
        }
      }

      if (DEBUG) {
        console.log(
          `Lines in diff: ${Array.from(linesInDiff)
            .sort((a, b) => a - b)
            .join(', ')}`,
        );
      }

      // Post inline failures for errors on lines that are in the diff
      for (const error of errors) {
        if (linesInDiff.has(error.start.line)) {
          if (DEBUG) {
            console.log(`Posting failure for ${filename}:${error.start.line}`);
          }
          fail(error.message, filename, error.start.line);
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
