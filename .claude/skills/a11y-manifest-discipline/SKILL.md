---
name: a11y-manifest-discipline
description: When shipping or modifying an accessibility audit fix doc, update `scripts/a11y/manifest.yml` in the same PR so the A11y PR Triage workflow can label PRs correctly. Use when the user says "shipping a new a11y fix doc", "adding a manifest entry", "updating an audit bucket", "the audit team is filing a new defect", or whenever you draft a new entry in the audit team's private categorization output.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# A11y manifest discipline

The accessibility PR triage system reads `scripts/a11y/manifest.yml` to decide what labels (and Slack pings) to apply to incoming PRs. This skill is the durable mechanism that keeps that manifest in sync with the audit team's source fix docs.

**The rule, in one sentence:** when you author a new fix doc (or change a fix doc's bucket, severity, or scope), commit the corresponding manifest entry in the same PR that introduces or references it.

If the manifest entry doesn't land, PRs closing that fix doc get labeled `a11y:broken-ref` and post a bot comment asking the audit team to add the entry. The triage system gracefully degrades, but every minute the manifest is stale is a minute reviewers are guessing.

## When to invoke

- Authoring a new fix doc in the audit team's private workspace (typically driven by the `issues-by-complexity-prompt.md` workflow).
- Re-bucketing a fix doc (e.g., a Bucket-2 defect turns out to require logic changes → Bucket 3).
- Renaming a slug (rare; coordinate with any open PRs referencing the old slug).
- Removing a fix doc (mark the manifest entry's bucket as `null` rather than deleting if PRs may still reference it; otherwise delete).

## The bucket framework (recap)

Four levels, chosen by how the fix is going to be implemented — not by the severity of the defect:

| Bucket | What it is                                                           | Reviewer signal                                           |
| ------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| 1      | CSS / token-only change. No logic, no markup change.                 | Design-mergeable. One reviewer.                           |
| 2      | HTML or ARIA attribute addition to existing elements. Static values. | Design-mergeable. One reviewer.                           |
| 3      | Logic, component composition, event handling, or state changes.      | Engineer reviewer required. Pings designer Slack channel. |
| 4      | Engineering plus product judgment (new UX shape, behavior change).   | Engineer + product. Pings designer Slack channel.         |

Boundary calls:

- "Add `aria-label`" = Bucket 2. "Add `aria-label` whose value depends on component state" = Bucket 3.
- "Add focus-ring CSS" = Bucket 1. "Add focus-ring CSS plus state-driven visibility" = Bucket 3.
- "Add `role` attribute" = Bucket 2. "Add `role` plus manage roving tabindex" = Bucket 3.
- When genuinely ambiguous between two buckets, prefer the higher one. Design can always escalate up; engineering can land design-bucket PRs trivially.

Full categorization framework lives in the audit team's private `issues-by-complexity-prompt.md`. This skill restates the bucket definitions for in-repo accessibility — it does not replace the prompt.

## The manifest schema

`scripts/a11y/manifest.yml` is a YAML sequence. Each entry:

```yaml
- slug: 1.4.13-tooltip
  sc: '1.4.13'
  bucket: 3
  severity: critical
  scope: ui-main
  files-touched: # optional
    - src/lib/holocene/tooltip.svelte
```

Field constraints (validated by `scripts/a11y/manifest.test.mjs`):

- `slug`: kebab-case, unique within the manifest. Convention: `{SC}-{description}`.
- `sc`: WCAG criterion in `X.Y.Z` form, quoted as a string.
- `bucket`: `1 | 2 | 3 | 4 | null`. Use `null` when the audit team has authored the doc but not yet categorized it; PRs referencing it will get `a11y:needs-categorization`.
- `severity`: `critical | serious | moderate | minor` (lowercase). Original audit vocabulary (High / Medium / Low / range expressions) gets normalized to this four-level rubric on entry.
- `scope`: `ui-main` or `universal`. (The validator's full enum accepts additional scope values for cross-repo cases, but this manifest holds `ui-main` entries by convention.)
- `files-touched`: optional list of repo-relative paths the fix touches. Useful but not yet consumed by tooling.

## The commit rule

When you ship a fix doc, the manifest entry lands in the same PR as the first code change that references it.

Cases:

1. **Audit team commits the entry alongside the designer's PR.** Common case. The audit team authors the fix doc privately, decides bucket, opens a PR (or piggybacks the designer's) that adds the manifest entry. If the designer's PR is already open, the audit team can push a commit to that branch adding the entry.

2. **PR opens before the manifest entry exists.** The PR gets `a11y:broken-ref` and a bot comment. Audit team adds the entry; on the PR's next `synchronize` event, labels update. Acceptable transient state — not a sustainable steady state.

3. **Entry needs to land before any PR references it** (e.g., a fix doc is published for community contribution). Open a manifest-only PR (no code changes) and merge it independently.

## Workflow

1. Decide the bucket using the framework above and the boundary calls. Verbose bucket-1-vs-2 or 2-vs-3 reasoning lives in the audit team's `issues-by-complexity` working draft, not in the manifest.

2. Construct the entry. Sort within the manifest by SC then by slug.

3. **Validate locally before committing:**

```sh
pnpm a11y:manifest:test
```

Expected output: `A11y manifest OK (N entries).` Any failure prints the offending entry and the rule it violated. Don't push without a green validator — CI will block the PR.

4. Commit with a message that names the slug, e.g.:

```
a11y(manifest): add 1.4.13-tooltip — bucket 3, ui-main, critical
```

Or, when piggy-backing on a code PR, fold the manifest change into the same commit.

5. If the PR you're updating is open and labeled with `a11y:broken-ref` or `a11y:needs-categorization`, the triage workflow will re-label on the next PR event (synchronize, edit, or `workflow_dispatch`). You can force it with:

```sh
gh workflow run a11y-pr-triage.yml --field pr_number=<n>
```

## Backfill and batch re-runs

The triage workflow's `workflow_dispatch` trigger lets you (re-)label any open PR — useful for one-time backfill after a manifest update or after fixing a workflow bug.

**Single PR**, via the Actions tab or CLI:

```sh
gh workflow run a11y-pr-triage.yml --field pr_number=<n>
```

**All open a11y PRs:**

```sh
gh pr list --search '"a11y" -is:closed' \
  --json number --jq '.[].number' \
  | xargs -I{} gh workflow run a11y-pr-triage.yml --field pr_number={}
```

Both invocations route through the workflow's `getPullRequest()` helper, which fetches the PR via API and runs the same triage logic the `pull_request` event would.

## Common pitfalls

- **Silent typo in slug.** PR labels report `a11y:broken-ref` but the bot comment shows the typo'd slug. Fix in the manifest OR the PR body, then re-trigger.
- **Bucket changed but PR not re-triggered.** Manifest change alone doesn't re-label open PRs. After landing a bucket change, dispatch the workflow against affected open PRs.
- **Quoting `sc`.** YAML interprets `1.4.13` as a string by default, but `1.4.10` may be parsed as a number losing the trailing zero. Always quote: `sc: '1.4.10'`.

## What this skill does not cover

- How to write the source fix doc. That's the audit team's `wcag-audit` skill (in their private workspace; an abbreviated in-repo port lives at `.claude/skills/wcag-audit/SKILL.md`).
- How a reviewer should react to the labels the triage workflow applies, or the title/trailer conventions a PR author must follow. See `.claude/skills/a11y-pr-review/SKILL.md`.

## References

- `scripts/a11y/manifest.yml` — the manifest itself.
- `scripts/a11y/manifest.test.mjs` — the validator.
- `.github/workflows/a11y-pr-triage.yml` — the workflow that reads the manifest.
