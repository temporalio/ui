import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { describe, expect, it, vi } from 'vitest';

import type { Context } from './main';
import { runReview } from './main';
import type { Meta } from './render';
import { MetaSchema, parseState, renderComment } from './render';
import type { ModelCall, Review } from './review';

const head = 'a'.repeat(40);
const base = 'b'.repeat(40);
const release = 'c'.repeat(40);
const context: Context = {
  repo: 'temporalio/ui',
  eventName: 'pull_request',
  eventPr: 42,
  inputPr: '42',
  inputEvent: 'pull_request',
  callerRef: 'refs/pull/42/merge',
  callerSha: head,
  callerWorkflowRef:
    'temporalio/ui/.github/workflows/io-usage-review-pr.yml@refs/pull/42/merge',
  selfRepo: 'temporalio/ui',
  selfSha: release,
  enabled: false,
  outputDir: '/unused',
  token: 'stub',
  apiKey: 'stub',
  importPrefix: '$lib/io/',
  rulesKind: 'dir',
};
const source =
  '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="x" extensions={[{}]} />';
const patch =
  '@@ -4 +4 @@\n-<Badge text="x" />\n+<Badge text="x" extensions={[{}]} />';
const usage = {
  file: 'src/x.svelte',
  line: 4,
  component: 'badge',
  verdict: 'violation' as const,
  ruleId: 'IN-2',
  pattern: null,
  reason: 'empty extension',
};
const oldMeta: Meta = {
  repo: 'temporalio/ui',
  pr: 42,
  prUrl: 'https://github.com/temporalio/ui/pull/42',
  headSha: 'd'.repeat(40),
  reviewStatus: 'complete',
  skippedFiles: [],
  missingRules: [],
  reason: null,
};
const oldBody = renderComment({ usages: [usage] }, oldMeta);
const ambiguousInputs = [
  {
    filename: 'src/x.svelte',
    content:
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="https://docs.temporal.io">Docs</a> <Badge text="" />',
    patch:
      '@@ -4 +4 @@\n-old\n+<a href="https://docs.temporal.io">Docs</a> <Badge text="" />',
  },
  {
    filename: 'src/x.ts',
    content:
      "import { Badge } from '$lib/io/badge';\nconst p = { href: 'https://docs.temporal.io', icon: Badge };",
    patch:
      "@@ -2 +2 @@\n-old\n+const p = { href: 'https://docs.temporal.io', icon: Badge };",
  },
  {
    filename: 'src/props.ts',
    content:
      "import type { ButtonProps } from '$lib/io/button';\nconst p: ButtonProps = {\n size: 'md',\n};",
    patch: "@@ -3 +3 @@\n- size: 'sm',\n+ size: 'md',",
  },
  {
    filename: 'src/deleted-props.ts',
    content:
      "import type { ButtonProps as Props } from '$lib/io/button';\nconst p: Props = {\n};",
    patch: "@@ -2,3 +2,2 @@\n const p: Props = {\n- size: 'sm',\n };",
  },
  {
    filename: 'src/masked-multiline.svelte',
    content:
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="https://docs.temporal.io"><Badge\n text=""\n/></a>',
    patch: '@@ -5 +5 @@\n- text="Active"\n+ text=""',
  },
  {
    filename: 'src/masked-deletion.svelte',
    content:
      '<script>\nimport { Badge as Label } from \'$lib/io/badge\';\n</script>\n<a href="https://docs"><Label\n/></a>',
    patch: '@@ -5 +5,0 @@\n- text="Active"',
  },
  {
    filename: 'src/masked-block.svelte',
    content:
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="/api/*">\n<Badge\n text=""\n/>\n</a>\n<style>/* Later comment */</style>',
    patch: '@@ -6 +6 @@\n- text="Active"\n+ text=""',
  },
];

function packedFixture(markdown: string): Buffer {
  const header = Buffer.alloc(512);
  header.write('package/dist/io/badge/badge.md');
  header.write('0000644\0', 100);
  header.write('0000000\0', 108);
  header.write('0000000\0', 116);
  header.write(
    `${Buffer.byteLength(markdown).toString(8).padStart(11, '0')}\0`,
    124,
  );
  header.fill(32, 148, 156);
  header.write('0', 156);
  header.write('ustar\0', 257);
  header.write(
    `${header
      .reduce((sum, byte) => sum + byte, 0)
      .toString(8)
      .padStart(6, '0')}\0 `,
    148,
  );
  const content = Buffer.from(markdown);
  return gzipSync(
    Buffer.concat([
      header,
      content,
      Buffer.alloc((512 - (content.length % 512)) % 512),
      Buffer.alloc(1024),
    ]),
  );
}

async function harness(
  options: {
    labels?: string[];
    fork?: boolean;
    bot?: boolean;
    missing?: boolean;
    noIo?: boolean;
    noPatch?: boolean;
    stale?: boolean;
    old?: string;
    model?: ModelCall;
    cap?: number;
    extraMissing?: boolean;
    artifactError?: boolean;
    pack?: Buffer;
    malformed?: boolean;
    headSha?: string;
    fixture?: { filename: string; content: string; patch: string };
  } = {},
  changes: Partial<Context> = {},
) {
  const current = { ...context, ...changes };
  const reviewedHead = options.headSha ?? head;
  const writes: {
    method: string;
    path: string;
    body: Record<string, string>;
  }[] = [];
  const artifacts: { findings: unknown; meta: Meta }[] = [];
  const summaries: string[] = [];
  let prReads = 0;
  const model = vi.fn(
    options.model ??
      (async () => ({
        stop_reason: 'end_turn',
        parsed_output: { usages: [usage] },
      })),
  );
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const route = url.pathname;
    if (init?.method && init.method !== 'GET') {
      writes.push({
        method: init.method,
        path: route,
        body: JSON.parse(String(init.body)),
      });
      return Response.json({});
    }
    if (route.endsWith('/pulls/42')) {
      prReads++;
      return Response.json({
        number: 42,
        html_url: `https://github.com/${current.repo}/pull/42`,
        state: 'open',
        user: { login: options.bot ? 'dependabot[bot]' : 'person' },
        labels: (options.labels ?? ['io-usage-review']).map((name) => ({
          name,
        })),
        head: {
          sha: options.stale && prReads > 1 ? 'e'.repeat(40) : reviewedHead,
          repo: { full_name: options.fork ? 'fork/ui' : current.repo },
        },
        base: { sha: base, repo: { full_name: current.repo } },
      });
    }
    if (route.endsWith('/pulls/42/files'))
      return Response.json([
        {
          filename: options.fixture?.filename ?? 'src/x.svelte',
          status: 'modified',
          patch: options.noPatch
            ? undefined
            : options.noIo
              ? '@@ -1 +1 @@\n-old\n+const x = 1'
              : (options.fixture?.patch ?? patch),
          additions: options.fixture
            ? options.fixture.patch
                .split('\n')
                .filter((line) => line.startsWith('+')).length
            : 1,
          deletions: options.fixture
            ? options.fixture.patch
                .split('\n')
                .filter((line) => line.startsWith('-')).length
            : 1,
        },
        ...(options.extraMissing
          ? [
              {
                filename: 'src/missing.ts',
                status: 'modified',
                additions: 1,
                deletions: 0,
              },
            ]
          : []),
      ]);
    if (route.endsWith('/issues/42/comments'))
      return Response.json(
        options.old
          ? [
              {
                id: 7,
                body: options.old,
                user: { login: 'github-actions[bot]' },
              },
            ]
          : [],
      );
    if (
      route.endsWith(`/contents/${options.fixture?.filename ?? 'src/x.svelte'}`)
    ) {
      expect(url.searchParams.get('ref')).toBe(reviewedHead);
      const content = options.noIo
        ? 'const x = 1'
        : (options.fixture?.content ?? source).replace(
            '$lib/io/',
            current.importPrefix,
          );
      return Response.json({
        type: 'file',
        size: Buffer.byteLength(content),
        encoding: 'base64',
        content: Buffer.from(content).toString('base64'),
      });
    }
    if (route.includes('/contents/src/lib/io/')) {
      expect(url.searchParams.get('ref')).toBe(base);
      if (options.missing) return Response.json({}, { status: 404 });
      const content = await readFile(
        path.resolve(
          route.endsWith('/button/button.md')
            ? 'src/lib/io/button/button.md'
            : 'scripts/io-usage-review/__fixtures__/badge/badge.md',
        ),
        'utf8',
      );
      return Response.json({
        type: 'file',
        size: Buffer.byteLength(content),
        encoding: 'base64',
        content: Buffer.from(content).toString('base64'),
      });
    }
    if (route.endsWith('/commits/codefreeze-bf-cm-2026'))
      return Response.json({ sha: base });
    if (route.includes('/compare/')) return Response.json({ status: 'ahead' });
    if (route.endsWith('/contents/.ui-sha')) {
      expect(url.searchParams.get('ref')).toBe(base);
      return Response.json({
        type: 'file',
        size: release.length,
        encoding: 'base64',
        content: Buffer.from(release).toString('base64'),
      });
    }
    if (route.includes('/contents/packs/')) {
      expect(url.searchParams.get('ref')).toBe(base);
      expect(route).toContain(`temporalio-ui-${release.slice(0, 8)}.tgz`);
      return Response.json({
        type: 'file',
        size: options.pack?.length ?? 0,
        encoding: 'none',
        content: '',
        sha: release,
      });
    }
    if (route.includes('/git/blobs/'))
      return Response.json({
        size: options.pack?.length ?? 0,
        encoding: 'base64',
        content: options.pack?.toString('base64') ?? '',
      });
    if (['/repos/temporalio/ui', '/repos/temporalio/cloud-ui'].includes(route))
      return Response.json({ default_branch: 'codefreeze-bf-cm-2026' });
    throw new Error(`Unexpected stub request ${route}`);
  };
  const result = await runReview(current, {
    fetch: fetcher,
    model,
    summary: (message) => {
      summaries.push(message);
    },
    artifacts: async (findings, meta) => {
      if (options.artifactError) throw new Error('stub disk failure');
      artifacts.push({ findings, meta });
    },
    maxInputChars: options.cap,
  });
  return { result, writes, artifacts, summaries, model };
}

describe('offline orchestration acceptance', () => {
  it('publishes one sticky warning and paired validated artifact at the current head', async () => {
    const result = await harness();
    expect(result.writes).toHaveLength(1);
    expect(result.writes[0].method).toBe('POST');
    expect(result.artifacts[0].meta.reviewStatus).toBe('complete');
    expect(MetaSchema.safeParse(result.artifacts[0].meta).success).toBe(true);
    expect(result.artifacts[0].findings).toHaveLength(1);
    expect(result.writes[0].body.body).toContain(`/blob/${base}/`);
  });

  it('uses only the actual Cloud base pack and supports GitHub large-file blob fallback', async () => {
    const cloud = {
      repo: 'temporalio/cloud-ui',
      importPrefix: '@temporalio/ui/io/',
      rulesKind: 'tarball',
      callerWorkflowRef:
        'temporalio/cloud-ui/.github/workflows/io-usage-review.yml@refs/pull/42/merge',
    };
    const markdown = await readFile(
      path.resolve('scripts/io-usage-review/__fixtures__/badge/badge.md'),
      'utf8',
    );
    const result = await harness({ pack: packedFixture(markdown) }, cloud);
    expect(result.artifacts[0].meta.reviewStatus).toBe('complete');
    expect(result.writes[0].body.body).toContain(`/blob/${release}/`);
    const missing = await harness(
      { pack: packedFixture('## Notes\nNo checked baseline') },
      cloud,
    );
    expect(missing.artifacts[0].meta).toMatchObject({
      reviewStatus: 'partial',
      missingRules: ['badge'],
    });
    expect(missing.model).not.toHaveBeenCalled();
  });

  it('updates the same comment on a second run', async () => {
    const result = await harness({ old: oldBody });
    expect(result.writes[0]).toMatchObject({
      method: 'PATCH',
      path: '/repos/temporalio/ui/issues/comments/7',
    });
  });

  it('complete nonzero preserves historical warnings and dedupes a repeated head', async () => {
    const first = await harness({ old: oldBody });
    expect(first.artifacts[0].meta.reviewStatus).toBe('complete');
    expect(first.artifacts[0].findings).toHaveLength(1);
    const state = parseState(first.writes[0].body.body);
    expect(state?.records.map((record) => record.headSha)).toEqual([
      oldMeta.headSha,
    ]);
    expect(first.writes[0].body.body).toContain(
      `originating head ${oldMeta.headSha}`,
    );
    const repeated = await harness({ old: first.writes[0].body.body });
    expect(parseState(repeated.writes[0].body.body)?.records).toEqual(
      state?.records,
    );
    expect(repeated.writes[0].body.body).not.toContain(
      `originating head ${head}`,
    );
  });

  it.each(ambiguousInputs)(
    'preserves prior warnings for ambiguous $filename IO changes',
    async (fixture) => {
      const result = await harness({ fixture, old: oldBody });
      expect(result.result).toBe('published');
      expect(result.artifacts[0]).toMatchObject({
        findings: [],
        meta: { reviewStatus: 'partial', headSha: head },
      });
      expect(result.model).not.toHaveBeenCalled();
      expect(result.writes[0].body.body).not.toContain(
        'No IO component usage changed',
      );
      expect(
        parseState(result.writes[0].body.body)?.records.map(
          (record) => record.headSha,
        ),
      ).toEqual([oldMeta.headSha]);
    },
  );

  it('reviews visible usages while preserving warnings for a masked multiline usage', async () => {
    const fixture = {
      filename: 'src/x.svelte',
      content:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="x" extensions={[{}]} />\n<a href="https://docs"><Badge\n text=""\n/></a>',
      patch:
        '@@ -4,3 +4,3 @@\n-<Badge text="x" />\n+<Badge text="x" extensions={[{}]} />\n <a href="https://docs"><Badge\n- text="Active"\n+ text=""',
    };
    const result = await harness({ fixture, old: oldBody });
    expect(result.result).toBe('published');
    expect(result.model).toHaveBeenCalledOnce();
    expect(result.artifacts[0]).toMatchObject({
      meta: { reviewStatus: 'partial' },
    });
    expect(result.artifacts[0].findings).toHaveLength(1);
    expect(
      parseState(result.writes[0].body.body)?.records.map(
        (record) => record.headSha,
      ),
    ).toEqual([oldMeta.headSha]);
    expect(result.writes[0].body.body).toContain(
      `originating head ${oldMeta.headSha}`,
    );
  });

  it('recovers duplicate history and keeps current findings publishing over 60 pushes', async () => {
    const longReason =
      'Empty badge text provides no visible label and loses essential context for assistive technology users. '
        .repeat(12)
        .trim();
    expect(longReason.length).toBe(1235);
    const first = parseState(oldBody);
    if (!first) throw new Error('Missing test history');
    const records = Array.from({ length: 19 }, (_, index) => ({
      headSha: index ? index.toString(16).padStart(40, '0') : oldMeta.headSha,
      finding: { ...first.records[0].finding, reason: longReason },
    }));
    let previous = `<!-- io-usage-review-bot -->\n${records.map((record) => `- ${longReason} (originating head ${record.headSha})`).join('\n')}\n<!-- io-usage-state:${Buffer.from(JSON.stringify({ meta: oldMeta, records })).toString('base64')} -->`;
    expect(previous.length).toBeLessThan(65_000);
    const initialChars = previous.length;
    const observations: {
      push: number;
      chars: number;
      records: number;
      headSha: string;
    }[] = [];
    let finalPair: { findings: unknown; meta: Meta } | undefined;
    for (let push = 1; push <= 60; push++) {
      const headSha = (push + 100).toString(16).padStart(40, '0');
      const reason = `${longReason} ${push}`;
      const result = await harness({
        headSha,
        old: previous,
        model: async () => ({
          stop_reason: 'end_turn',
          parsed_output: { usages: [{ ...usage, reason }] },
        }),
      });
      expect(result.result).toBe('published');
      expect(result.model).toHaveBeenCalledOnce();
      expect(result.writes).toHaveLength(1);
      expect(result.artifacts).toHaveLength(1);
      finalPair = result.artifacts[0];
      expect(finalPair.meta).toMatchObject({
        reviewStatus: 'complete',
        headSha,
      });
      expect(finalPair.findings).toEqual([
        { ...first.records[0].finding, reason },
      ]);
      previous = result.writes[0].body.body;
      expect(previous.length).toBeLessThan(65_000);
      expect(previous).toContain(`Reviewed head: ${headSha}`);
      expect(previous).toContain(`originating head ${oldMeta.headSha}`);
      const state = parseState(previous);
      expect(state?.records).toEqual([
        {
          headSha: oldMeta.headSha,
          finding: { ...first.records[0].finding, reason },
        },
      ]);
      observations.push({
        push,
        chars: previous.length,
        records: state?.records.length ?? -1,
        headSha,
      });
    }
    const zero = await harness({
      headSha: 'e'.repeat(40),
      noIo: true,
      old: previous,
    });
    expect(zero.result).toBe('published');
    expect(zero.artifacts[0]).toMatchObject({
      findings: [],
      meta: { reviewStatus: 'complete', headSha: 'e'.repeat(40) },
    });
    expect(parseState(zero.writes[0].body.body)?.records).toEqual([]);
    const directory = process.env.IO_REVIEW_EVIDENCE_DIR;
    if (directory) {
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, 'orchestration-stress.json'),
        JSON.stringify(
          {
            pushes: 60,
            reasonChars: longReason.length,
            initialRecords: records.length,
            initialChars,
            origin: oldMeta.headSha,
            minChars: Math.min(...observations.map((item) => item.chars)),
            maxChars: Math.max(...observations.map((item) => item.chars)),
            observations,
            finalPair,
            zeroPair: zero.artifacts[0],
          },
          null,
          2,
        ),
      );
      await writeFile(
        path.join(directory, 'orchestration-stress-comment.txt'),
        previous,
      );
    }
  });

  it.each([{ labels: [] }, { fork: true }, { bot: true }])(
    'skips automatically without writes/artifacts %j',
    async (options) => {
      const result = await harness(options);
      expect(result.writes).toEqual([]);
      expect(result.artifacts).toEqual([]);
      expect(result.model).not.toHaveBeenCalled();
    },
  );

  it('allows variable opt-in and manual fork/bot review on the trusted current default', async () => {
    expect(
      (await harness({ labels: [] }, { enabled: true })).writes,
    ).toHaveLength(1);
    const manual: Partial<Context> = {
      eventName: 'workflow_dispatch',
      inputEvent: 'workflow_dispatch',
      eventPr: undefined,
      dispatchPr: '42',
      callerRef: 'refs/heads/codefreeze-bf-cm-2026',
      callerSha: base,
      callerWorkflowRef:
        'temporalio/ui/.github/workflows/io-usage-review-pr.yml@refs/heads/codefreeze-bf-cm-2026',
    };
    expect(
      (await harness({ fork: true, bot: true }, manual)).writes,
    ).toHaveLength(1);
    expect((await harness({ labels: [] }, manual)).writes).toEqual([]);
    expect(
      (await harness({}, { ...manual, callerRef: 'refs/heads/feature' }))
        .writes,
    ).toEqual([]);
  });

  it.each([
    { inputPr: '42junk' },
    { inputPr: '-1' },
    { inputPr: '43' },
    { inputEvent: 'workflow_dispatch' },
    { repo: 'evil/repo' },
    { selfRepo: 'evil/ui' },
  ])('rejects invalid or forged context %j', async (changes) => {
    expect((await harness({}, changes)).writes).toEqual([]);
  });

  it('complete no-IO resolves previous warnings, without creating a clean comment when absent', async () => {
    const result = await harness({ noIo: true, old: oldBody });
    expect(result.model).not.toHaveBeenCalled();
    expect(parseState(result.writes[0].body.body)?.records).toEqual([]);
    expect(result.artifacts[0]).toMatchObject({
      findings: [],
      meta: { reviewStatus: 'complete' },
    });
    expect((await harness({ noIo: true })).writes).toEqual([]);
  });

  it.each([{ missing: true }, { cap: 1 }, { noPatch: true }])(
    'partial empty preserves prior warnings %j',
    async (options) => {
      const result = await harness({ ...options, old: oldBody });
      expect(result.artifacts[0].meta.reviewStatus).toBe('partial');
      expect(parseState(result.writes[0].body.body)?.records[0].headSha).toBe(
        oldMeta.headSha,
      );
      expect(result.writes[0].body.body).not.toContain(
        'No IO component usage changed',
      );
    },
  );

  it('unavailable/refused and absent output never resolve', async () => {
    for (const parsed_output of [null, { usages: [] }]) {
      const result = await harness({
        old: oldBody,
        model: async () => ({ stop_reason: 'end_turn', parsed_output }),
      });
      expect(result.artifacts[0].meta.reviewStatus).toBe('unavailable');
      expect(parseState(result.writes[0].body.body)?.records).toHaveLength(1);
    }
    const result = await harness({
      old: oldBody,
      model: async () => ({ stop_reason: 'refusal', parsed_output: null }),
    });
    expect(result.artifacts[0].meta.reviewStatus).toBe('unavailable');
  });

  it('partial nonempty updates current findings while preserving original provenance', async () => {
    const result = await harness({ extraMissing: true, old: oldBody });
    expect(result.artifacts[0].meta.reviewStatus).toBe('partial');
    expect(
      parseState(result.writes[0].body.body)?.records.map(
        (record) => record.headSha,
      ),
    ).toEqual([oldMeta.headSha]);
    expect(result.artifacts[0].findings).toHaveLength(1);
  });

  it('artifact staging failure cannot clear previous warnings', async () => {
    const result = await harness({
      artifactError: true,
      noIo: true,
      old: oldBody,
    });
    expect(result.result).toBe('failed');
    expect(result.writes).toEqual([]);
  });

  it('stale runs make no comment or artifact writes', async () => {
    const result = await harness({ stale: true, old: oldBody });
    expect(result.writes).toEqual([]);
    expect(result.artifacts).toEqual([]);
  });

  it('malformed prior metadata cannot erase warnings', async () => {
    const result = await harness({
      noIo: true,
      old: '<!-- io-usage-review-bot -->\n⚠️ prior warning with missing metadata',
    });
    expect(result.artifacts[0].meta.reviewStatus).toBe('partial');
    expect(result.writes[0].body.body).toContain(
      'prior warning with missing metadata',
    );
  });

  it('publishes real fixture snapshots for independent replay', async () => {
    const result = await harness({ old: oldBody });
    expect(result.result).toBe('published');
    const review: Review = { usages: [usage] };
    expect(
      parseState(result.writes[0].body.body)?.records[0].finding.reason,
    ).toBe(review.usages[0].reason);
    const directory = process.env.IO_REVIEW_EVIDENCE_DIR;
    if (directory) {
      await mkdir(directory, { recursive: true });
      const scenarios = [
        ['complete-warning', result],
        [
          'complete-clean',
          await harness({
            model: async () => ({
              stop_reason: 'end_turn',
              parsed_output: { usages: [{ ...usage, verdict: 'aligned' }] },
            }),
          }),
        ],
        [
          'complete-no-io-after-warning',
          await harness({ noIo: true, old: oldBody }),
        ],
        [
          'partial-missing-rules',
          await harness({ missing: true, old: oldBody }),
        ],
        ['partial-input-cap', await harness({ cap: 1, old: oldBody })],
        ['partial-empty', await harness({ noPatch: true, old: oldBody })],
        [
          'partial-nonempty',
          await harness({ extraMissing: true, old: oldBody }),
        ],
        [
          'unavailable-refusal',
          await harness({
            old: oldBody,
            model: async () => ({
              stop_reason: 'refusal',
              parsed_output: null,
            }),
          }),
        ],
        ['skipped', await harness({ labels: [], old: oldBody })],
        ['stale', await harness({ stale: true, old: oldBody })],
        ...(await Promise.all(
          ambiguousInputs.map(
            async (fixture, index) =>
              [
                `ambiguous-io-${index + 1}`,
                await harness({ fixture, old: oldBody }),
              ] as const,
          ),
        )),
      ] as const;
      await writeFile(
        path.join(directory, 'fixture-evidence.json'),
        JSON.stringify(
          scenarios.map(([name, value]) => ({
            name,
            outcome: value.result,
            artifacts: value.artifacts,
            comments: value.writes,
            summaries: value.summaries,
          })),
          null,
          2,
        ),
      );
    }
  });
});
