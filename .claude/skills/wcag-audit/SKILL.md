---
name: wcag-audit
description: Run a row of accessibility audit verification work against this codebase. Covers the four verification work shapes, the static-vs-manual decision discipline, inventory practice, verdict logic, the severity rubric, and the anti-patterns the audit team has hit. Use when extending the WCAG 2.2 AA audit beyond the May 2026 baseline, working a new criterion row, or reconciling matrix state with shipped fix docs.
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

# WCAG audit verification work

A reference for running a row of WCAG 2.2 AA verification work in this codebase. Codifies the patterns the audit team validated against the May 2026 baseline (SC 1.4.12 Text Spacing, 2.4.11 Focus Not Obscured, 3.3.3 Error Suggestion, 4.1.2 Name Role Value).

This skill is the in-repo distillation of the audit team's private process artefact. The full source — including worked examples that cite specific issue docs — lives in their workspace. This file is the public, auditable version that survives team membership changes.

> **Status:** Initial port 2026-05-27. Patterns are validated only against the four rows above; sections do not generalize to criterion shapes that haven't been exercised yet. Extend only after a row's verification log establishes a new pattern.

## 1. The four verification work shapes

Identifying the shape before drafting any prompt is the highest-leverage decision; the wrong shape produces dilution or rework.

### 1.1 Fresh-discovery sweep

**Trigger:** the row has a review note and no prior audit work — no verification doc, no fix docs, no prior log entries.

**Phase structure:**

1. Inventory or surface map (denominator).
2. Per-element evaluation against canonical-bar rules.
3. Defect classification and severity assignment.
4. Issue file drafts for defects that move the verdict.
5. Matrix update with verification log.

**Deliverable:** a sweep document, per-defect fix docs for any move-the-verdict findings, matrix row updated.

**Risk:** scope sprawl. The inventory needs a denominator definition before evaluation starts, or "we evaluated N candidates" can't be defended.

### 1.2 Light pass plus reconcile

**Trigger:** prior audit work exists (cited evidence in the matrix, possibly a verification doc) but is incomplete or has stale framings.

**Phase structure:**

1. Re-confirm cited evidence at the cited file:line locations (verbatim `sed` or `grep -n`).
2. Resolve any inconsistencies.
3. Cross-reference with adjacent rows where coordination is needed.
4. Append a verification log entry with the reconciliation date and outcome.

**Deliverable:** updated matrix row(s); existing issue files corrected. No new sweep document.

**Risk:** unauthorized scope expansion. Scope is "verify and reconcile what's documented" — not "discover what was missed." If new defects surface during the light pass, flag them rather than absorbing them.

### 1.3 Falsification sweep

**Trigger:** the row already has a Supports verdict and the work is to either reinforce it under wider coverage or refute it with new evidence.

**Phase structure:**

1. Inventory the surface beyond what the existing Supports verdict spot-checked.
2. Apply the canonical-bar rules across the expanded surface.
3. Apply explicit verdict logic: Path A (defects exist but don't trigger the move-to-Partially threshold) or Path B (defects do trigger it).
4. If Path A: matrix log entry reinforcing the verdict; optional thin trackers for tracked remediation.
5. If Path B: matrix verdict moves to Partially Supports; full issue files drafted.

**Risk:** manufactured findings to justify the sweep's effort. The framing is "find evidence that would refute Supports," not "find defects." If the corpus reinforces Supports, that's a legitimate outcome.

### 1.4 Reconciliation only

**Trigger:** extensive prior audit work exists (verification doc plus multiple fix docs) but the matrix remarks haven't absorbed it.

**Phase structure:**

1. List matrix-enumerated defects.
2. List fix-doc-enumerated defects.
3. Compare. The mismatch is the work product.
4. Update matrix remark to reference every fix doc by category.
5. Append verification log entry.
6. Conditionally trigger a delta sweep only if specific staleness signals surface.

**Deliverable:** updated matrix row(s) only. No new fix docs unless the conditional delta sweep triggered.

**Risk:** scope creep into fresh discovery. The trigger threshold for the delta sweep should be specific evidence, not general discomfort.

## 2. Static-vs-manual discipline

**Principle:** resolve statically when the failure mode is deterministic from code and layout properties. Reserve manual observation for behaviors that genuinely depend on runtime variability, browser-specific rendering, real-content interaction, or sibling reflow that can't be predicted from layout properties alone.

**Decision question:** _what would manual observation actually test that static analysis hasn't already established?_ If the answer is "nothing — we'd be confirming what the math already says," skip the manual.

**Manual is still warranted when:**

- Real content variability matters (long customer namespace names you can't simulate from grep).
- Browser-engine differences resolve flex `min-width: auto` differently and the corpus has both engines in production.
- Animation or interaction timing affects the failure.

## 3. Pre-pass narrowing for layout-collision findings

A specific application of §2. When a finding involves flex layout, overflow behavior, or collision between sibling elements, a static pre-pass can falsify candidate failure modes before any manual testing.

**The four checks:**

1. **Label / content overflow handling.** Does the inner element have `truncate`, `overflow-hidden`, `whitespace-nowrap`, an explicit `max-width`? Record verbatim what classes and styles are on the element.
2. **`min-width` chain inspection.** Walk from the element up to the flex container. For each ancestor, record `min-w-*` declarations. Tailwind default is `min-width: auto` (min-content); only `min-w-0` permits shrinking past content.
3. **Separator and icon shrink behavior.** Non-label flex children with intrinsic width absorb shrink pressure differently. Note `shrink-0` declarations.
4. **Parent flex children shrink behavior.** Inspect the parent container's `flex: 1` / `flex-grow` / `flex-shrink` / `flex-basis`.

**Expected output:** a narrowed failure mode list. Each falsified mode gets an explicit reason. The remaining modes determine the manual test scope.

## 4. Inventory before evaluation

**Principle:** build a denominator before classifying numerator findings. "We found N defects" doesn't have meaning without "out of M total surfaces evaluated."

**When it matters most:** criteria with broad surface area — forms, all focusable elements, error messages, every custom widget, every page route. Without an inventory, the verdict can't survive a procurement reviewer asking "what fraction of the product did you actually look at?"

**When it matters less:** criteria with narrow surface area — a single layout shell, a specific primitive, a single form field.

**Inventory document minimum:** a coverage summary table with columns for total candidates, pre-release excluded, prior-pass covered, wrapper-or-renderer-only (no validation logic — counted out with explicit reason), and in-scope-for-this-pass.

**Secondary benefit:** triage during inventory often surfaces patterns before evaluation runs. Don't treat inventory as pure denominator-building; it's also reconnaissance.

## 5. Umbrella vs per-component issue file structuring

**Umbrella shape** (one issue file, multiple manifestations): same root cause, same fix approach, coordinated PR scope. Used when the structural defect is the finding and component-level instances are just where it manifests.

**Per-component shape** (multiple issue files, one per defect): localized defects, distinct root causes, separate remediation tracks.

**Thin trackers paired with evaluation doc** (intermediate): Path A outcome with real engineering work queued. The evaluation doc is the working artefact; thin trackers exist for remediation visibility without implying the verdict was wrong.

**Signals favoring umbrella:** same pattern recurring across 3+ instances; shared fix mechanism (same CSS variable, same validator refactor, same ARIA attribute); engineer would naturally batch into one PR.

**Signals favoring per-component:** distinct fix approaches even if the SC is the same; different teams or release schedules; different severity.

## 6. Verdict logic

- **Path A — verdict holds.** Used when the sweep produces zero substantive defects or only Minor defects on low-traffic surfaces. Deliverable: matrix log entries reinforcing the verdict, optional thin trackers.
- **Path B — verdict moves to Partially Supports.** Used when substantive defects exist. Explicit threshold: _multiple Serious-or-higher defects, or defects concentrated on high-traffic forms._ Below that threshold, Path A applies even if defects exist.
- **Reconciled (verdict unchanged, evidence updated).** Used in reconciliation work and light passes. The verdict was directionally correct; the matrix evidence was incomplete.
- **Tracked-remediation Partially Supports.** Used when the verdict is honest about open work and gated on specific PRs landing.

**Severity-bracketing rule:** if the highest individual severity in a finding set is Critical, the umbrella finding is Critical even if most individual defects are Moderate. Bracketing works upward; many Moderate defects do not aggregate up to Serious.

**The general principle:** the verdict serves the matrix reader (procurement, auditor, engineer looking at conformance state), not the auditor's effort accounting. A long sweep that legitimately reinforces Supports is a complete deliverable.

## 7. Severity rubric

Four-level rubric. The in-repo manifest (`scripts/a11y/manifest.yml`) normalizes all severity values to this rubric.

- **Critical** — defect makes a primary user task unrecoverable. Example: a focused element fully hidden under a sticky bar with no scroll-margin; a primary navigation control clipped off-viewport.
- **Serious** — defect significantly impairs task completion. User has to guess multiple times, consult external docs, or perform a workaround.
- **Moderate** — irritating but recoverable. User can usually figure out the correction.
- **Minor** — low-traffic surface or edge case.

**Calibration that emerged:** severity multiplied by prevalence is the real impact. A Moderate defect on every authenticated route can outweigh a Serious defect on a single settings page.

## 8. Verification log entries

The most load-bearing section. Matrix remarks drift out of sync with fix-doc inventories when verification log entries are deferred.

**Rule: verification log entries are required output for every row this audit touches.** Not optional, not deferred. If a row is verified or reconciled, the log entry lands in the same change as the matrix update.

**Required fields:**

- Date
- Pass type (light pass, full sweep, reconciliation, issue file drafted, delta sweep — pick one)
- Source of evidence (verification doc path, sweep doc path, fix docs referenced)
- What was checked
- What was found (counts, defect categories, false positives resolved)
- Verdict outcome (unchanged at X, moved to Y, etc.)
- Optional: methodology observations (rare; only when the pass surfaces a pattern worth recording)

**Template:**

> **Verification log YYYY-MM-DD (pass type):** [what was done in 2-3 clauses]. [Key findings in 1-2 sentences]. **Result:** [verdict outcome statement]. [Optional: coordination notes, methodology observations].

**Multiple entries per row are fine.** A row can carry several log entries in sequence (light pass → issue file drafted → reconciliation). Each is dated; together they reconstruct the row's audit history.

## 9. Scope discipline

**When to confirm before sweeping:**

- The strictness bar is ambiguous (e.g., "is 'X is required' a defect?").
- Sub-criterion scope is unclear.
- Codebase coverage is ambiguous.

Proceed without confirmation when the next step is mechanical (running inventory greps, reading files, classifying matches against an established bar).

**Primitive cascade.** Defects in Holocene primitives published through `@temporalio/ui` cascade to downstream consumers. When fixing a primitive, prefer a single primitive-level fix doc over per-consumer fix docs; consumers inherit the fix on the next package bump.

## 10. Anti-patterns

### 10.1 Manufactured findings to justify sweep effort

The audit's incentive structure rewards finding things to file. Reinforcing Supports is a complete deliverable. A long full sweep that closes at Path A is not a failed sweep.

### 10.2 Default-to-manual when static would close

The decision question: _what does manual observation actually test that static hasn't already established?_ If "nothing," skip manual.

### 10.3 Scope drift in either direction

Scope-shrink (running a light pass when a full sweep was scoped) and scope-expansion (running a delta sweep when reconciliation was scoped) both need pushback. Direction doesn't matter; the audit should do the work that was scoped.

### 10.4 Stale matrix state assumed without checking

Always grep the current matrix row before writing a sweep prompt. Prior assumptions go stale fast as the matrix updates.

### 10.5 Issue files for findings that didn't move the verdict, without the tracker framing

Creates verdict-drift questions later ("if there's an issue file, why is the verdict at Supports?"). Use the thin-tracker shape with an explicit "Status: verdict unaffected, tracked for X" header.

### 10.6 Deferring verification log entries

The reconciliation pattern in §1.4 has repeatedly been needed because log entries weren't landing alongside the fix docs that motivated them. **Land the log entry with the fix doc.**

## 11. Connecting to the in-repo system

When a fix doc lands, it must be reflected in `scripts/a11y/manifest.yml` for the PR triage workflow to label correctly. See `.claude/skills/a11y-manifest-discipline/SKILL.md` for the commit rule and the bucket framework.

For reviewing PRs that close audit fix docs, see `.claude/skills/a11y-pr-review/SKILL.md`.

The full audit team's process artefact — including worked examples that cite specific issue docs by name — lives in their private workspace and is not committed to the repo. This skill is the durable, public-facing distillation.
