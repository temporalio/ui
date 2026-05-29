---
name: a11y-pr-review
description: Review a pull request that the A11y PR Triage workflow has labeled with `a11y:*` labels. Use the bucket label to decide review depth, the SC label to know what WCAG criterion the PR closes, and the failure-mode labels to know what's blocked. Use when the user says "review this a11y PR", "is this PR safe to merge", "what does this `a11y:broken-ref` label mean", or asks for the right reviewer for an accessibility PR.
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

# A11y PR review

Reviewing an accessibility PR labeled by the A11y PR Triage workflow. The bucket label tells you how much engineering review the change needs; the failure-mode labels tell you what's still pending before a clean review can happen.

## PR conventions the action looks for

Two conventions drive the workflow. Authors of a11y PRs must follow both; reviewers should know they exist so labels make sense in context.

**Title gate.** The workflow matches `/^(fix\()?a11y[():]/i`. The target convention going forward is `a11y(<WCAG-code>): <description>` (e.g., `a11y(1.4.13): make Tooltip keyboard-accessible`). Legacy `fix(a11y):` and `a11y:` forms are still accepted during the transition. Titles that don't match the gate are not triaged — no labels are applied.

**Trailer.** One `A11y-Audit-Ref: <slug>` line per fix doc closed, anywhere in the PR body. Case-insensitive; bare slug only (no path, no `.md`):

```
A11y-Audit-Ref: 2.5.8-chip-remove-button
A11y-Audit-Ref: 1.4.13-tooltip
```

Multi-criterion PRs include multiple trailers — the action takes `max(bucket)` across all referenced entries when applying the bucket label, and emits one `a11y:sc-*` label per criterion. The slugs are looked up in `scripts/a11y/manifest.yml`; see the `a11y-manifest-discipline` skill for how those manifest entries are authored and maintained.

## Quick reference

| Label                       | What it means                                                                | What to do                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a11y`                      | Umbrella. PR title matched the a11y gate.                                    | Always present on triaged PRs.                                                                                                                                      |
| `a11y:bucket-1`             | CSS / token-only. No logic.                                                  | One design reviewer suffices. Verify visual change matches the fix doc; merge.                                                                                      |
| `a11y:bucket-2`             | HTML / ARIA attr addition.                                                   | One design reviewer suffices. Spot-check the attribute value; merge.                                                                                                |
| `a11y:bucket-3`             | Logic / component change.                                                    | Engineer reviewer required. Pull down the branch, exercise the path. Slack already pinged.                                                                          |
| `a11y:bucket-4`             | Engineering + product judgment.                                              | Engineer + product. Discuss design implications before merge. Slack already pinged.                                                                                 |
| `a11y:sc-X.Y.Z`             | One per WCAG criterion the PR closes.                                        | Informational. Multiple labels = multi-criterion PR.                                                                                                                |
| `a11y:needs-categorization` | Referenced manifest entry exists but has no bucket.                          | **Don't merge until audit team assigns a bucket.** Ping audit team.                                                                                                 |
| `a11y:broken-ref`           | `A11y-Audit-Ref:` line points to a slug not in the manifest.                 | **Don't merge.** Either the slug is misspelled (ask author) or the entry hasn't been authored (ping audit team).                                                    |
| `a11y:no-fix-doc`           | PR title matches the a11y gate but no `A11y-Audit-Ref:` line is in the body. | Acceptable for ad-hoc fixes if the audit team has explicitly opted not to track. Otherwise, ask author to add the trailer; ping audit team to add a manifest entry. |

## Per-bucket review depth

### Bucket 1 — CSS / token-only

Examples: rem-based font-size, focus-ring color contrast token swap, scroll-margin addition.

Review checklist:

- Read the diff. Confirm it's CSS only — no JS or template logic changes.
- If a color or token changed, check that the new value meets the WCAG threshold the fix claims (e.g., 4.5:1 for text contrast). The fix doc (private) has the calculation; if not obvious from the manifest, ask the audit team.
- Optional: spin up the dev server and eyeball the change at the affected route. Often unnecessary for token swaps that cascade.
- One design reviewer's approval is sufficient.

Time budget: under 5 minutes.

### Bucket 2 — HTML / ARIA attributes

Examples: `aria-label` on icon-only button, `role="radiogroup"`, `autocomplete` prop forwarding, `scope="col"` on table headers.

Review checklist:

- Read the diff. Confirm only attribute additions or static-value changes.
- For `aria-label` / `aria-labelledby`: verify the value is meaningful (not the literal element name). For i18n strings, confirm the translation key exists.
- For `role` changes: confirm the role matches the element's actual behavior. `role="button"` on a non-`<button>` element still needs keyboard handlers — flag if missing (would push the change to Bucket 3).
- For `autocomplete`: WHATWG token list lookup. `email`, `current-password`, `new-password`, `username`, etc.
- One design reviewer's approval is sufficient.

Time budget: 5–10 minutes.

### Bucket 3 — Logic / component changes

Examples: Tooltip rewrite (keyboard-accessible + dismissible), focus restoration after modal close, severity-icon pairing with state, name-role-value sweep across primitives.

Review checklist:

- The Slack channel was already pinged. If you're reviewing, you saw it.
- Pull the branch down or open it in a preview environment.
- Exercise the keyboard path: Tab, Shift+Tab, Enter, Space, Escape. Each interactive element should be reachable and the visual focus indicator should be visible.
- If screen-reader behavior is claimed in the PR description: smoke-test with VoiceOver (Cmd+F5 on macOS) or NVDA. Confirm the new announcement matches the PR claim.
- Check that no consumer of the affected primitive breaks. Primitive changes (e.g., `Button`, `Tooltip`, `Input`) cascade to many call sites; the audit team's fix doc usually enumerates the consumer surface, but you should grep for usages in both repos if the primitive is widely used.
- Engineer reviewer's approval required.

Time budget: 15–45 minutes depending on the primitive's reach.

### Bucket 4 — Engineering + product

Examples: session-timeout warning UX, prefers-reduced-motion fallback, account-deletion pre-expiration warning, "consistent help" mechanism.

Review checklist:

- The change implicates a product decision (what should the new behavior be? what should the copy say?). Engineering review alone is insufficient.
- Loop in product before approving the implementation. Confirm the chosen UX shape aligns with broader product direction.
- All Bucket-3 review steps apply too (keyboard, AT, primitive cascade).
- Engineer + product approval required.

Time budget: variable. Often blocked on product input before any keyboard testing.

## Failure-mode triage

### `a11y:needs-categorization`

The referenced manifest entry exists in `scripts/a11y/manifest.yml` but has `bucket: null`. The audit team filed the defect but hasn't yet decided which bucket it falls into.

What to do:

1. Don't merge. The categorization affects who needs to review.
2. Ping the audit team in the designer Slack channel; ask them to assign a bucket.
3. Once the manifest is updated, dispatch the triage workflow against this PR:
   ```sh
   gh workflow run a11y-pr-triage.yml --repo temporalio/<repo> --field pr_number=<n>
   ```
   The label updates and you can proceed with the appropriate bucket's review steps.

### `a11y:broken-ref`

The PR body has an `A11y-Audit-Ref: <slug>` line, but `<slug>` isn't in the manifest. Either the slug is misspelled or the manifest entry hasn't been authored yet.

What to do:

1. Read the bot comment the triage workflow posted; it names the offending slug.
2. Compare the slug to entries in `scripts/a11y/manifest.yml`. If close to an existing slug, ask the author to fix the trailer.
3. If genuinely unknown, ping the audit team; they may need to add the entry. See `a11y-manifest-discipline` skill for what they should do.
4. Re-dispatch the triage workflow after the fix.

### `a11y:no-fix-doc`

No `A11y-Audit-Ref:` line in the PR body. Either the author forgot, or this is a net-new defect not covered by the audit.

What to do:

1. Read the PR. Is the change clearly addressing a defect the audit team would have caught (e.g., adding `aria-label` to an icon-only button on a route they audited)?
   - If yes: the author probably forgot the trailer. Ask them to add `A11y-Audit-Ref:` referencing the right slug (or coordinate with the audit team if no slug exists yet).
   - If the change is genuinely new (e.g., a brand-new component the audit hasn't seen): coordinate with the audit team in Slack. They may add a manifest entry retroactively, or accept the PR as an ad-hoc fix and let the `a11y:no-fix-doc` label persist as a historical signal.
2. For internal PRs, defer the merge until the audit team has weighed in. For external contributors, weigh the cost of holding the PR open against the cost of merging without classification.

## When to escalate

- **`a11y:bucket-3` or `a11y:bucket-4` PR sat for > 2 days unreviewed.** The Slack channel was pinged at label-application time; if no one picked it up, re-ping with the PR link. The frontend team's batch-review cadence is the bottleneck.
- **Manifest entry disputes.** If you think the audit team's bucket assignment is wrong (e.g., they marked something Bucket 2 but the diff has real logic), comment on the PR and tag the audit team. They have the source fix doc to refer back to.
- **Cross-cutting primitive changes.** A `Button` or `Tooltip` change can cascade to 100+ consumers. Engineer review must include "did the cascade plan get exercised?" — confirm via grep across the repo. If the audit team's fix doc doesn't enumerate the consumer surface, request that detail before merging.

## References

- `scripts/a11y/manifest.yml` — the manifest the action reads.
- `.claude/skills/a11y-manifest-discipline/SKILL.md` — companion skill for the audit team side (manifest authoring + backfill).
