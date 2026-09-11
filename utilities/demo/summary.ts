import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { chalk } from 'zx';

import { catalogExampleUrl } from './catalog';
import type { Definition, Stage } from './definition';
import { runDirFor } from './paths';
import type { StartedWorkflow } from './scenario';

export type StageOutcome = {
  stage: Stage;
  ran: boolean;
  reason?: string;
  details: string[];
};

export type SummaryInput = {
  definition: Definition;
  definitionPath: string;
  stages: StageOutcome[];
  workflows: StartedWorkflow[];
  observations: string[];
  webUrl?: string;
  bundledUiUrl?: string;
  address?: string;
};

const historyUrl = (
  base: string,
  namespace: string,
  workflow: StartedWorkflow,
) =>
  `${base}/namespaces/${namespace}/workflows/${encodeURIComponent(workflow.workflowId)}/${workflow.runId}/history`;

const previewBase = ({ webUrl, bundledUiUrl }: SummaryInput) =>
  webUrl ?? bundledUiUrl;

export const renderMarkdown = (input: SummaryInput): string => {
  const { definition, stages, workflows, observations } = input;
  const namespace = definition.server.namespace;
  const base = previewBase(input);
  const lines: string[] = [];

  lines.push(`# ${definition.title}`);
  lines.push('');

  if (definition.feature) lines.push(`**Feature:** ${definition.feature}  `);
  lines.push(`**Definition:** \`${input.definitionPath}\``);
  lines.push('');

  if (definition.summary) {
    lines.push(definition.summary);
    lines.push('');
  }

  lines.push('## What this run did');
  lines.push('');

  for (const stage of stages) {
    lines.push(
      `### ${stage.stage} — ${stage.ran ? 'ran' : `skipped${stage.reason ? ` (${stage.reason})` : ''}`}`,
    );
    lines.push('');

    if (stage.details.length) {
      for (const detail of stage.details) lines.push(`- ${detail}`);
      lines.push('');
    }
  }

  if (workflows.length) {
    lines.push('## Workflows to look at');
    lines.push('');

    for (const workflow of workflows) {
      const link =
        base && workflow.runId
          ? `[${workflow.workflowId}](${historyUrl(base, namespace, workflow)})`
          : `\`${workflow.workflowId}\``;

      lines.push(`- **${workflow.role}** ${link}`);
      if (workflow.runId) lines.push(`  - run: \`${workflow.runId}\``);
      if (workflow.note) lines.push(`  - ${workflow.note}`);
      if (base && workflow.catalogExampleId) {
        lines.push(
          `  - catalog example: [${workflow.catalogExampleId}](${catalogExampleUrl(base, namespace, workflow.catalogExampleId)})`,
        );
      }
    }

    lines.push('');
  }

  if (observations.length) {
    lines.push('## What to look for');
    lines.push('');
    for (const observation of observations) lines.push(`- ${observation}`);
    lines.push('');
  }

  if (definition.preview.notes.length) {
    lines.push('## Review steps');
    lines.push('');
    definition.preview.notes.forEach((note, index) => {
      lines.push(`${index + 1}. ${note}`);
    });
    lines.push('');
  }

  if (!base) {
    lines.push(
      '> No UI was started by this run. Start one, then open the workflows above.',
    );
    lines.push('');
  }

  return lines.join('\n');
};

export const printSummary = (
  input: SummaryInput,
  write: (message: string) => void = console.log,
) => {
  const { definition, stages, workflows, observations } = input;
  const namespace = definition.server.namespace;
  const base = previewBase(input);

  const heading = (text: string) => write(`\n${chalk.bold.cyan(text)}`);

  write(`\n${chalk.bold.green('▸')} ${chalk.bold(definition.title)}`);

  heading('What this run did');
  for (const stage of stages) {
    const label = stage.ran
      ? chalk.green('ran')
      : chalk.yellow(`skipped${stage.reason ? ` (${stage.reason})` : ''}`);

    write(`  ${stage.stage.padEnd(10)} ${label}`);
    for (const detail of stage.details) write(chalk.dim(`    ${detail}`));
  }

  if (workflows.length) {
    heading('Workflows to look at');
    for (const workflow of workflows) {
      write(`  ${chalk.bold(workflow.role)}  ${workflow.workflowId}`);
      if (base && workflow.runId) {
        write(
          chalk.blue.underline(`    ${historyUrl(base, namespace, workflow)}`),
        );
      }
      if (workflow.note) write(chalk.dim(`    ${workflow.note}`));
      if (base && workflow.catalogExampleId) {
        write(
          chalk.dim(
            `    catalog example ${workflow.catalogExampleId}: ${catalogExampleUrl(base, namespace, workflow.catalogExampleId)}`,
          ),
        );
      }
    }
  }

  if (observations.length) {
    heading('What to look for');
    for (const observation of observations) write(`  - ${observation}`);
  }

  if (definition.preview.notes.length) {
    heading('Review steps');
    definition.preview.notes.forEach((note, index) => {
      write(`  ${index + 1}. ${note}`);
    });
  }
};

export const writeSummary = async (input: SummaryInput) => {
  const directory = runDirFor(input.definition.name);

  await mkdir(directory, { recursive: true });

  const path = join(directory, 'summary.md');

  await writeFile(path, renderMarkdown(input));

  return path;
};
