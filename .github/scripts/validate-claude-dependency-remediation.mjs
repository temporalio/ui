#!/usr/bin/env node

import { appendFile, readFile, writeFile } from 'node:fs/promises';

import { applyRemediation } from './apply-weekly-dependency-remediation.mjs';

export function validateClaudeRemediation({ baseText, candidateText, report }) {
  const base = JSON.parse(baseText);
  JSON.parse(candidateText);

  if (!Array.isArray(report?.actions)) {
    throw new Error('Remediation report must contain an actions array.');
  }

  const hasAuthorizedActions = report.actions.length > 0;
  const expectedText = hasAuthorizedActions
    ? `${JSON.stringify(applyRemediation(base, report), null, 2)}\n`
    : baseText;
  const changed = hasAuthorizedActions && expectedText !== baseText;

  if (candidateText !== expectedText) {
    throw new Error(
      'Claude candidate does not exactly match the authorized remediation actions.',
    );
  }

  const validatedReport = structuredClone(report);
  if (changed) {
    validatedReport.applied = true;
    validatedReport.resolver = 'claude-code';
  } else {
    validatedReport.applied = false;
    delete validatedReport.resolver;
  }

  return { changed, report: validatedReport };
}

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--base') options.base = args[++index];
    else if (argument === '--candidate') options.candidate = args[++index];
    else if (argument === '--report') options.report = args[++index];
    else if (argument === '--github-output')
      options.githubOutput = args[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  for (const required of ['base', 'candidate', 'report']) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  return options;
}

export async function runCli(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  const [baseText, candidateText, reportText] = await Promise.all([
    readFile(options.base, 'utf8'),
    readFile(options.candidate, 'utf8'),
    readFile(options.report, 'utf8'),
  ]);
  const validated = validateClaudeRemediation({
    baseText,
    candidateText,
    report: JSON.parse(reportText),
  });
  await writeFile(
    options.report,
    `${JSON.stringify(validated.report, null, 2)}\n`,
  );
  if (options.githubOutput) {
    await appendFile(options.githubOutput, `changed=${validated.changed}\n`);
  }
  return validated;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
