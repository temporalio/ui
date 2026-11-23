import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { findCandidates, findIoImports, inScope } from './detect';
import type { Finding, Meta } from './render';
import {
  escapeText,
  FindingSchema,
  MARKER,
  MetaSchema,
  parseState,
  renderComment,
  toFindings,
} from './render';
import type { ModelCall, Review, ReviewFile } from './review';
import {
  buildPrompt,
  ReviewSchema,
  reviewUsages,
  validateReview,
} from './review';
import { loadRules, readTarRules } from './rules';

export type Context = {
  repo: string;
  eventName: string;
  eventPr?: number;
  dispatchPr?: string;
  inputPr: string;
  inputEvent: string;
  callerRef: string;
  callerSha: string;
  callerWorkflowRef: string;
  selfRepo: string;
  selfSha: string;
  enabled: boolean;
  outputDir: string;
  token: string;
  apiKey: string;
  importPrefix: string;
  rulesKind: string;
};
type Dependencies = {
  fetch: typeof fetch;
  model: ModelCall;
  summary: (message: string) => void;
  artifacts: (findings: Finding[], meta: Meta) => Promise<void>;
  maxInputChars?: number;
};
const ShaSchema = z.string().regex(/^[a-f0-9]{40}$/);
const PrSchema = z.object({
  number: z.number().int().positive(),
  html_url: z.string(),
  state: z.string(),
  user: z.object({ login: z.string() }),
  labels: z.array(z.object({ name: z.string() })),
  head: z.object({
    sha: ShaSchema,
    repo: z.object({ full_name: z.string() }).nullable(),
  }),
  base: z.object({ sha: ShaSchema, repo: z.object({ full_name: z.string() }) }),
});
const FileSchema = z.object({
  filename: z.string(),
  previous_filename: z.string().optional(),
  status: z.string(),
  patch: z.string().optional(),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
});
const CommentSchema = z.object({
  id: z.number().int().positive(),
  body: z.string().nullable(),
  user: z.object({ login: z.string() }),
});
const BlobSchema = z.object({
  size: z.number().int().nonnegative(),
  encoding: z.literal('base64'),
  content: z.string(),
});
const ContentSchema = z.object({
  type: z.literal('file'),
  size: z.number().int().nonnegative(),
  encoding: z.enum(['base64', 'none']),
  content: z.string(),
  sha: ShaSchema.optional(),
});
const MAX_INPUT_CHARS = 400_000;

export async function runReview(
  context: Context,
  deps: Dependencies,
): Promise<'published' | 'skipped' | 'stale' | 'failed'> {
  const summary = deps.summary;
  const skip = (reason: string): 'skipped' => {
    summary(`IO usage review skipped: ${reason}`);
    return 'skipped';
  };
  const api = async (
    route: string,
    method = 'GET',
    body?: object,
    accept = 'application/vnd.github+json',
  ): Promise<unknown> => {
    const response = await deps.fetch(`https://api.github.com${route}`, {
      method,
      headers: {
        Authorization: `Bearer ${context.token}`,
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`GitHub request failed (${response.status})`);
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.length;
        if (bytes > 12_000_000) {
          await reader.cancel();
          throw new Error('GitHub response too large');
        }
        chunks.push(chunk.value);
      }
    }
    const text = Buffer.concat(chunks).toString('utf8');
    return text ? JSON.parse(text) : null;
  };
  const content = async (
    repo: string,
    file: string,
    ref: string,
    limit: number,
  ): Promise<Buffer> => {
    const entry = ContentSchema.parse(
      await api(
        `/repos/${repo}/contents/${file.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`,
        'GET',
        undefined,
        'application/vnd.github.object+json',
      ),
    );
    if (entry.size > limit) throw new Error('Oversized file');
    const data =
      entry.encoding === 'base64'
        ? entry
        : entry.sha
          ? BlobSchema.parse(await api(`/repos/${repo}/git/blobs/${entry.sha}`))
          : null;
    if (!data || data.size !== entry.size)
      throw new Error('Missing file content');
    if (data.size > limit || !/^[A-Za-z0-9+/=\s]*$/.test(data.content))
      throw new Error('Missing or oversized file content');
    const buffer = Buffer.from(data.content, 'base64');
    if (buffer.length !== data.size) throw new Error('Truncated file content');
    return buffer;
  };
  const repoRoot = `/repos/${context.repo}`;
  let meta: Meta | null = null;
  let review: Review | null = null;
  let docsSha = context.selfSha;
  try {
    if (
      !['temporalio/ui', 'temporalio/cloud-ui'].includes(context.repo) ||
      context.selfRepo !== 'temporalio/ui' ||
      !ShaSchema.safeParse(context.selfSha).success
    )
      return skip('Untrusted workflow identity');
    if (
      !['pull_request', 'workflow_dispatch'].includes(context.eventName) ||
      context.inputEvent !== context.eventName
    )
      return skip('Unsupported or mismatched event');
    const expectedPrefix =
      context.repo === 'temporalio/ui' ? '$lib/io/' : '@temporalio/ui/io/';
    if (
      context.importPrefix !== expectedPrefix ||
      context.rulesKind !==
        (context.repo === 'temporalio/ui' ? 'dir' : 'tarball')
    )
      return skip('Invalid caller rules configuration');
    if (!/^[1-9]\d*$/.test(context.inputPr)) return skip('Invalid PR number');
    const prNumber = Number(context.inputPr);
    if (
      !Number.isSafeInteger(prNumber) ||
      (context.eventName === 'pull_request'
        ? context.eventPr !== prNumber
        : context.dispatchPr !== context.inputPr)
    )
      return skip('PR input does not match triggering event');
    const entryFile =
      context.repo === 'temporalio/ui'
        ? 'io-usage-review-pr.yml'
        : 'io-usage-review.yml';
    if (
      context.callerWorkflowRef !==
        `${context.repo}/.github/workflows/${entryFile}@${context.callerRef}` ||
      (context.eventName === 'pull_request' &&
        context.callerRef !== `refs/pull/${prNumber}/merge`)
    )
      return skip('Unexpected caller workflow identity');
    const pr = PrSchema.parse(await api(`${repoRoot}/pulls/${prNumber}`));
    if (
      pr.number !== prNumber ||
      pr.base.repo.full_name !== context.repo ||
      pr.html_url !== `https://github.com/${context.repo}/pull/${prNumber}` ||
      pr.state !== 'open'
    )
      return skip('Invalid or closed PR');
    if (
      context.eventName === 'pull_request' &&
      (pr.head.repo?.full_name !== context.repo ||
        pr.user.login === 'dependabot[bot]')
    )
      return skip('Automatic fork or Dependabot review is disabled');
    if (
      !context.enabled &&
      !pr.labels.some((label) => label.name === 'io-usage-review')
    )
      return skip('Activation gate is off');
    const repository = z
      .object({ default_branch: z.string().regex(/^[\w./-]+$/) })
      .parse(await api(repoRoot));
    if (context.eventName === 'workflow_dispatch') {
      const defaultHead = z
        .object({ sha: ShaSchema })
        .parse(
          await api(
            `${repoRoot}/commits/${encodeURIComponent(repository.default_branch)}`,
          ),
        );
      if (
        context.callerRef !== `refs/heads/${repository.default_branch}` ||
        context.callerSha !== defaultHead.sha ||
        context.callerWorkflowRef !==
          `${context.repo}/.github/workflows/${entryFile}@refs/heads/${repository.default_branch}`
      )
        return skip(
          'Manual run must use the current trusted default workflow revision',
        );
    }
    const uiRepository =
      context.repo === 'temporalio/ui'
        ? repository
        : z
            .object({ default_branch: z.string() })
            .parse(await api('/repos/temporalio/ui'));
    const uiHead = z
      .object({ sha: ShaSchema })
      .parse(
        await api(
          `/repos/temporalio/ui/commits/${encodeURIComponent(uiRepository.default_branch)}`,
        ),
      );
    const comparison = z
      .object({ status: z.string() })
      .parse(
        await api(
          `/repos/temporalio/ui/compare/${context.selfSha}...${uiHead.sha}`,
        ),
      );
    if (!['ahead', 'identical'].includes(comparison.status))
      return skip(
        'Reusable release is not integrated into the current UI default',
      );
    meta = MetaSchema.parse({
      repo: context.repo,
      pr: prNumber,
      prUrl: pr.html_url,
      headSha: pr.head.sha,
      reviewStatus: 'complete',
      skippedFiles: [],
      missingRules: [],
      reason: null,
    });
    docsSha = pr.base.sha;
    const partial = (reason: string): void => {
      if (!meta) return;
      meta.reviewStatus = 'partial';
      meta.reason = meta.reason ? `${meta.reason}; ${reason}` : reason;
    };
    const files: z.infer<typeof FileSchema>[] = [];
    for (let page = 1; page <= 30; page++) {
      const batch = z
        .array(FileSchema)
        .max(100)
        .parse(
          await api(
            `${repoRoot}/pulls/${prNumber}/files?per_page=100&page=${page}`,
          ),
        );
      files.push(...batch);
      if (batch.length < 100) break;
      if (page === 30) partial('GitHub file-list limit reached');
    }
    const candidates: ReviewFile[] = [];
    const imported = new Set<string>();
    for (const file of files) {
      if (!inScope(file.filename) || file.status === 'removed') continue;
      if (
        !['added', 'modified', 'renamed', 'copied', 'changed'].includes(
          file.status,
        )
      ) {
        partial('Unsupported file status');
        meta.skippedFiles.push(file.filename);
        continue;
      }
      if (
        !file.patch ||
        file.patch.endsWith('...') ||
        !/^@@ /m.test(file.patch)
      ) {
        partial('Missing or truncated patch');
        meta.skippedFiles.push(file.filename);
        continue;
      }
      const added = file.patch
        .split('\n')
        .filter((line) => line.startsWith('+')).length;
      const removed = file.patch
        .split('\n')
        .filter((line) => line.startsWith('-')).length;
      if (added !== file.additions || removed !== file.deletions) {
        partial('Incomplete patch');
        meta.skippedFiles.push(file.filename);
        continue;
      }
      let text: string;
      try {
        if (!pr.head.repo || !/^[\w.-]+\/[\w.-]+$/.test(pr.head.repo.full_name))
          throw new Error('Missing head repository');
        text = (
          await content(
            pr.head.repo.full_name,
            file.filename,
            pr.head.sha,
            1_000_000,
          )
        ).toString('utf8');
      } catch {
        partial('Missing or truncated file content');
        meta.skippedFiles.push(file.filename);
        continue;
      }
      const found = findCandidates(
        text,
        file.patch,
        context.importPrefix,
        file.filename,
      );
      if (found.uncertain) partial('Unsupported or ambiguous IO usage');
      for (const component of findIoImports(text, context.importPrefix))
        imported.add(component);
      if (found.candidates.length)
        candidates.push({
          path: file.filename,
          content: text,
          patch: file.patch,
          candidates: found.candidates,
        });
    }
    let packed: Map<string, string> | null = null;
    if (context.rulesKind === 'tarball' && imported.size) {
      const uiSha = (await content(context.repo, '.ui-sha', pr.base.sha, 100))
        .toString('utf8')
        .trim();
      if (!ShaSchema.safeParse(uiSha).success)
        throw new Error('Invalid pinned UI SHA');
      docsSha = uiSha;
      packed = readTarRules(
        await content(
          context.repo,
          `packs/temporalio-ui-${uiSha.slice(0, 8)}.tgz`,
          pr.base.sha,
          8_000_000,
        ),
      );
    }
    const loaded = await loadRules(
      [...imported],
      { kind: 'dir', root: '' },
      async (component) => {
        if (packed) return packed.get(component) ?? null;
        try {
          return (
            await content(
              context.repo,
              `src/lib/io/${component}/${path.posix.basename(component)}.md`,
              pr.base.sha,
              150_000,
            )
          ).toString('utf8');
        } catch {
          return null;
        }
      },
    );
    meta.missingRules = loaded.missing;
    if (loaded.missing.length) partial('Missing or unusable rules context');
    const included: ReviewFile[] = [];
    const limit = deps.maxInputChars ?? MAX_INPUT_CHARS;
    for (const file of candidates) {
      if (
        file.candidates.some(
          (candidate) => !loaded.rules.has(candidate.component),
        )
      ) {
        meta.skippedFiles.push(file.path);
        partial('Usage has no checkable baseline');
        continue;
      }
      const prompt = buildPrompt([...included, file], loaded.rules);
      if (prompt.system.length + prompt.user.length > limit) {
        meta.skippedFiles.push(file.path);
        partial('Input character cap reached');
        continue;
      }
      included.push(file);
    }
    if (included.length) {
      const result = await reviewUsages(
        deps.model,
        buildPrompt(included, loaded.rules),
      );
      if (!result.ok) {
        meta.reviewStatus = 'unavailable';
        meta.reason = result.reason;
      } else review = validateReview(result.review, included, loaded.rules);
    } else review = { usages: [] };
    return await publish();
  } catch {
    if (!meta) {
      summary(
        'IO usage review unavailable before eligibility could be established',
      );
      return 'failed';
    }
    meta.reviewStatus = 'unavailable';
    meta.reason = 'Review failed validation or a required request';
    review = null;
    try {
      return await publish();
    } catch {
      summary(
        'IO usage review unavailable: publication failed; prior results retained',
      );
      return 'failed';
    }
  }

  async function publish(): Promise<'published' | 'stale'> {
    if (!meta) throw new Error('Missing review metadata');
    const comments: z.infer<typeof CommentSchema>[] = [];
    for (let page = 1; page <= 100; page++) {
      const batch = z
        .array(CommentSchema)
        .max(100)
        .parse(
          await api(
            `${repoRoot}/issues/${meta.pr}/comments?per_page=100&page=${page}`,
          ),
        );
      comments.push(...batch);
      if (batch.length < 100) break;
      if (page === 100) throw new Error('Comment pagination limit');
    }
    const existing = comments.find(
      (comment) =>
        comment.user.login === 'github-actions[bot]' &&
        comment.body?.startsWith(MARKER),
    );
    const previous = existing?.body ? parseState(existing.body) : null;
    if (
      previous &&
      (previous.meta.repo !== meta.repo || previous.meta.pr !== meta.pr)
    )
      throw new Error('Prior identity mismatch');
    if (existing && !previous) {
      meta.reviewStatus = 'partial';
      meta.reason = 'Prior warning state is unreadable; retained below';
    }
    const findings = z
      .array(FindingSchema)
      .parse(review ? toFindings(review, meta) : []);
    let body = renderComment(review, meta, previous, docsSha);
    if (existing?.body && !previous)
      body += `\n\nPreserved previous bot result (unvalidated):\n${escapeText(existing.body)}`;
    if (body.length > 65_000)
      throw new Error('Comment size limit; retain previous warnings');
    const latest = PrSchema.parse(await api(`${repoRoot}/pulls/${meta.pr}`));
    if (latest.head.sha !== meta.headSha || latest.state !== 'open') {
      summary('IO usage review stale: no comment or artifact published');
      return 'stale';
    }
    await deps.artifacts(findings, MetaSchema.parse(meta));
    const beforeComment = PrSchema.parse(
      await api(`${repoRoot}/pulls/${meta.pr}`),
    );
    if (
      beforeComment.head.sha !== meta.headSha ||
      beforeComment.state !== 'open'
    ) {
      summary('IO usage review stale: staged artifacts withheld');
      return 'stale';
    }
    if (existing)
      await api(`${repoRoot}/issues/comments/${existing.id}`, 'PATCH', {
        body,
      });
    else if (
      findings.length ||
      review?.usages.length ||
      meta.reviewStatus !== 'complete'
    )
      await api(`${repoRoot}/issues/${meta.pr}/comments`, 'POST', { body });
    const current = PrSchema.parse(await api(`${repoRoot}/pulls/${meta.pr}`));
    if (current.head.sha !== meta.headSha) {
      summary('Head changed during publication; artifact withheld');
      return 'stale';
    }
    summary(
      `IO usage review ${meta.reviewStatus}: ${findings.length} new findings at ${meta.headSha}`,
    );
    return 'published';
  }
}

async function main(): Promise<void> {
  const env = process.env;
  const summary = (text: string): void => {
    if (env.GITHUB_STEP_SUMMARY)
      void appendFile(env.GITHUB_STEP_SUMMARY, `${escapeText(text)}\n`).catch(
        () => undefined,
      );
  };
  try {
    const event = z
      .object({
        pull_request: z.object({ number: z.number() }).optional(),
        inputs: z.object({ pr_number: z.string().optional() }).optional(),
      })
      .parse(JSON.parse(await readFile(env.GITHUB_EVENT_PATH ?? '', 'utf8')));
    const outcome = await runReview(
      {
        repo: env.GITHUB_REPOSITORY ?? '',
        eventName: env.GITHUB_EVENT_NAME ?? '',
        eventPr: event.pull_request?.number,
        dispatchPr: event.inputs?.pr_number,
        inputPr: env.PR_NUMBER ?? '',
        inputEvent: env.TRIGGER_EVENT ?? '',
        callerRef: env.GITHUB_REF ?? '',
        callerSha: env.GITHUB_SHA ?? '',
        callerWorkflowRef: env.GITHUB_WORKFLOW_REF ?? '',
        selfRepo: env.REVIEW_WORKFLOW_REPOSITORY ?? '',
        selfSha: env.REVIEW_WORKFLOW_SHA ?? '',
        enabled: env.IO_USAGE_REVIEW_ENABLED === 'true',
        outputDir: env.OUTPUT_DIR ?? '',
        token: env.GITHUB_TOKEN ?? '',
        apiKey: env.ANTHROPIC_API_KEY ?? '',
        importPrefix: env.IMPORT_PREFIX ?? '',
        rulesKind: env.RULES_SOURCE ?? '',
      },
      {
        fetch,
        summary,
        model: async (prompt) =>
          createModelCall(
            new Anthropic({
              apiKey: env.ANTHROPIC_API_KEY ?? '',
              maxRetries: 0,
              timeout: 180_000,
            }),
          )(prompt),
        artifacts: async (findings, meta) => {
          const directory = env.OUTPUT_DIR;
          if (!directory) throw new Error('Missing output directory');
          await mkdir(directory, { recursive: true });
          await writeFile(
            path.join(directory, 'io-usage-findings.json'),
            JSON.stringify(findings, null, 2),
          );
          await writeFile(
            path.join(directory, 'io-usage-meta.json'),
            JSON.stringify(meta, null, 2),
          );
        },
      },
    );
    if (outcome === 'published' && env.GITHUB_OUTPUT)
      await appendFile(env.GITHUB_OUTPUT, 'published=true\n');
  } catch {
    summary('IO usage review unavailable: initialization failed');
  }
}

export function createModelCall(client: Anthropic): ModelCall {
  return async (prompt) =>
    client.beta.messages.parse({
      model: 'claude-sonnet-5-5',
      max_tokens: 16000,
      stream: false,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: zodOutputFormat(ReviewSchema),
      },
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void main().catch(() => {
    process.exitCode = 0;
  });
}
