import { readFile } from 'node:fs/promises';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

import { z } from 'zod';

const workflowPath = '.github/workflows/io-usage-review.yml';

describe('reusable-only workflow release boundary', () => {
  it('parses YAML, exposes only workflow_call, minimizes permissions and serializes runs', async () => {
    const text = await readFile(workflowPath, 'utf8');
    const workflow = z
      .object({
        on: z
          .object({
            workflow_call: z.object({
              inputs: z.object({
                'pr-number': z.object({ type: z.literal('string') }),
                'trigger-event': z.object({ type: z.literal('string') }),
              }),
              secrets: z
                .object({
                  ANTHROPIC_API_KEY: z.object({ required: z.boolean() }),
                })
                .strict(),
            }),
          })
          .strict(),
        permissions: z
          .object({
            contents: z.literal('read'),
            'pull-requests': z.literal('write'),
          })
          .strict(),
        concurrency: z.object({
          group: z.string(),
          'cancel-in-progress': z.literal(false),
        }),
        jobs: z.object({
          review: z.object({
            'continue-on-error': z.literal(true),
            'timeout-minutes': z.number(),
            steps: z.array(
              z.object({ uses: z.string().optional() }).passthrough(),
            ),
          }),
        }),
      })
      .parse(yaml.load(text));
    expect(workflow.concurrency.group).toContain('github.repository');
    for (const step of workflow.jobs.review.steps)
      if (step.uses) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
    expect(text).not.toContain('pull_request_target');
    expect(text).not.toContain('secrets: inherit');
    expect(text).not.toContain('@main');
  });

  it('executes the exact reusable script release and keeps event values outside run commands', async () => {
    const text = await readFile(workflowPath, 'utf8');
    expect(text).toContain('repository: ${{ job.workflow_repository }}');
    expect(text).toContain('ref: ${{ job.workflow_sha }}');
    expect(text).toContain('persist-credentials: false');
    expect(text).toContain('@anthropic-ai/sdk@1.12.0 zod@4.4.3 tsx@4.23.15');
    expect(text).toContain('--ignore-scripts');
    const workflow = z
      .object({
        jobs: z.object({
          review: z.object({
            steps: z.array(
              z.object({ run: z.string().optional() }).passthrough(),
            ),
          }),
        }),
      })
      .parse(yaml.load(text));
    for (const step of workflow.jobs.review.steps)
      if (step.run) expect(step.run).not.toContain('${{');
    expect(text).toContain('io-usage-findings.json');
    expect(text).toContain('io-usage-meta.json');
  });
});
