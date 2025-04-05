import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { Result } from 'axe-core';
import { chalk } from 'zx';

import { type AccessibilityViolationSummary, summarize } from './summarize';
import { toMarkdown } from './to-markdown';
import { unique } from './unique';

class AccessibilityReporter implements Reporter {
  public violations: AccessibilityViolationSummary[] = [];
  public options: { outputFile: string } = {
    outputFile: './playwright-report/accessibility-violations.json',
  };

  constructor(
    options = {
      outputFile: './playwright-report/accessibility-violations.json',
    },
  ) {
    this.options = options;

    console.log('🦾 Collecting accessibility violations…');
    console.log(
      `📝 Violations will be written to: ${chalk.cyan(
        this.options.outputFile,
      )}`,
    );
  }

  onTestEnd(_: TestCase, result: TestResult) {
    if (result.status === 'passed') return;
    if (!result.attachments) return;

    const violationAttachment = result.attachments.find(
      (attachemnt) => attachemnt.name === 'violations',
    );

    if (!violationAttachment) return;

    const { violations, url } = JSON.parse(violationAttachment.body.toString());

    this.violations.push(
      ...violations.map((violation: Result) => summarize(violation, url)),
    );
  }

  async onEnd() {
    if (!this.violations.length) return;

    const violations = unique(this.violations);

    await writeFile(
      this.options.outputFile,
      JSON.stringify(violations, null, 2),
    ).catch((error) => console.error(error));

    const markdown = await toMarkdown(violations);
    const markdownFile = join(
      dirname(this.options.outputFile) + '/accessibility-violations.md',
    );

    await writeFile(markdownFile, markdown).catch((error) =>
      console.error(error),
    );

    console.log(
      `🐱 ${chalk.red(
        violations.length,
      )} accessibility violations written to: ${chalk.cyan(
        this.options.outputFile,
      )}`,
    );

    console.log(`\t↳ Markdown report written to: ${chalk.cyan(markdownFile)}`);
  }
}
export default AccessibilityReporter;
