# ESLint 9 Migration - Required Fixes

**Status:** In Progress
**Priority:** Medium
**Effort:** ~2-3 days
**Total Issues:** 28 errors flagged by ESLint

---

## Overview

After migrating to ESLint 9 with flat config, several code quality issues were surfaced by new and updated Svelte linting rules. All rules have been configured as warnings to avoid blocking development. This document outlines the issues that need to be addressed, **ranked from lowest to highest frequency** (easiest to eliminate first).

---

## Issues by Rule (Ranked by Frequency - Low to High)

### 1. svelte/no-useless-mustaches (1 instance) ⭐ QUICK WIN

**Severity:** Low - Code Quality
**Effort:** Low
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/

**Description:**
Flags unnecessary mustache interpolations with string literal values.

**Why This Matters:**

- Minor code quality/readability issue
- Adds unnecessary syntax

**Affected Files:**

- `src/lib/components/lines-and-dots/svg/timeline-graph-row.svelte` (line 213)

**Fix:**
Remove unnecessary mustaches.

```svelte
<!-- Bad -->
<div>{'static text'}</div>

<!-- Good -->
<div>static text</div>
```

---

**🤖 AI FIXABILITY: HIGH (Automatic)**

**PROMPT FOR AI:**

```
Read the file src/lib/components/lines-and-dots/svg/timeline-graph-row.svelte and find line 213.
Look for any mustache interpolations like {"..."} or {`...`} that contain only string literals.
Remove the curly braces and quotes, leaving just the plain text.
Example: {"text"} becomes text, {`string`} becomes string
```

**REQUIRED CONTEXT:**

- File: `src/lib/components/lines-and-dots/svg/timeline-graph-row.svelte`
- Pattern to find: `{"string"}` or `{` ` string` `}`
- Pattern to replace: Just the inner string content

---

### 2. svelte/require-store-reactive-access (1 instance) ⭐ QUICK WIN

**Severity:** High - Reactivity Bugs
**Effort:** Low
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-reactive-access/

**Description:**
Requires using the `$` prefix or `get()` function to access reactive store values instead of accessing the raw store object.

**Why This Matters:**

- Accessing raw store won't create reactive subscriptions
- UI won't update when store changes
- Common source of reactivity bugs

**Affected Files:**

- `src/lib/holocene/menu/menu-container.svelte` (line 52)

**Fix:**
Use `$` prefix for auto-subscription.

```svelte
<!-- Bad -->
<script>
  import { myStore } from './stores';
  console.log(myStore); // Raw store object
</script>

<!-- Good -->
<script>
  import { myStore } from './stores';
  console.log($myStore); // Reactive value
</script>
```

---

**🤖 AI FIXABILITY: HIGH (Automatic)**

**PROMPT FOR AI:**

```
Read src/lib/holocene/menu/menu-container.svelte and locate line 52.
Find any store variable being accessed without the $ prefix (e.g., myStore instead of $myStore).
Add the $ prefix to access the reactive value.
Be careful not to add $ to the store in import statements or where the store itself needs to be passed as a reference.
```

**REQUIRED CONTEXT:**

- File: `src/lib/holocene/menu/menu-container.svelte` around line 52
- Look for: Store variables accessed without `$` prefix
- Pattern: `storeName` → `$storeName` (but not in imports or function parameters)

---

### 3. import/order (1 instance) ⭐ QUICK WIN

**Severity:** Low - Code Quality
**Effort:** Low

**Description:**
Enforces configured import ordering rules (empty lines within import groups).

**Why This Matters:**

- Consistency across codebase
- Minor code quality issue

**Affected Files:**

- `.storybook/preview.ts` (line 2)

**Fix:**
Remove empty lines within import groups or adjust grouping.

---

**🤖 AI FIXABILITY: HIGH (Automatic)**

**PROMPT FOR AI:**

```
Read .storybook/preview.ts and examine the imports at the top of the file around line 2.
According to the import/order rule, there should be no empty lines within the same import group.
Remove any empty lines that appear between imports of the same group (all external imports should be together, all internal imports should be together).
Keep empty lines between different groups (e.g., between external and internal imports).
```

**REQUIRED CONTEXT:**

- File: `.storybook/preview.ts` lines 1-10
- Look for: Empty lines within import groups
- Fix: Remove empty line at line 2

---

### 4. no-undef (1 instance) ⭐ QUICK WIN

**Severity:** Medium - Type Safety
**Effort:** Low

**Description:**
ESLint core rule detecting undefined variables.

**Why This Matters:**

- May indicate missing type definitions
- Could cause runtime errors

**Affected Files:**

- `src/lib/holocene/lazy-visibility/lazy-visibility.svelte` (line 8: 'IntersectionObserverInit')

**Fix:**
Add proper TypeScript definitions or import types.

```typescript
// Fix: Ensure DOM types are available
/// <reference lib="dom" />
```

---

**🤖 AI FIXABILITY: MEDIUM (Semi-automatic)**

**PROMPT FOR AI:**

```
Read src/lib/holocene/lazy-visibility/lazy-visibility.svelte around line 8.
Find where IntersectionObserverInit is used. This is a built-in DOM API type.
Check if there's a TypeScript reference comment at the top of the file.
If missing, add /// <reference lib="dom" /> at the very top of the script tag.
Alternatively, if the file uses TypeScript, ensure it's typed as a .ts or has lang="ts" on the script tag.
```

**REQUIRED CONTEXT:**

- File: `src/lib/holocene/lazy-visibility/lazy-visibility.svelte`
- Look for: Usage of `IntersectionObserverInit` around line 8
- Check: TypeScript configuration and DOM lib references
- Fix: Add `/// <reference lib="dom" />` or ensure proper TypeScript setup

---

### 5. @typescript-eslint/ban-types (2 instances) ⭐ QUICK WIN

**Severity:** Low - Configuration
**Effort:** Low

**Description:**
Shows "Definition for rule was not found" error because the rule was disabled but inline comments in code reference it.

**Why This Matters:**

- Inline rule disables don't work if rule doesn't exist
- Minor configuration cleanup

**Affected Files:**

- `src/lib/stores/configurable-table-columns.ts` (line 33)
- `src/lib/utilities/omit.ts` (line 2)

**Fix:**
Remove inline `eslint-disable` comments for this rule since it's disabled globally.

```typescript
// Bad (if rule is disabled)
// eslint-disable-next-line @typescript-eslint/ban-types
type Foo = {};

// Good (just remove the comment)
type Foo = {};
```

---

**🤖 AI FIXABILITY: HIGH (Automatic)**

**PROMPT FOR AI:**

```
Read these two files:
1. src/lib/stores/configurable-table-columns.ts (line 33)
2. src/lib/utilities/omit.ts (line 2)

Find any ESLint comment directives that mention @typescript-eslint/ban-types:
- // eslint-disable-next-line @typescript-eslint/ban-types
- // eslint-disable @typescript-eslint/ban-types
- /* eslint-disable @typescript-eslint/ban-types */

Remove these comment lines entirely since the rule is disabled globally in the config.
```

**REQUIRED CONTEXT:**

- Files:
  - `src/lib/stores/configurable-table-columns.ts` around line 33
  - `src/lib/utilities/omit.ts` around line 2
- Look for: ESLint disable comments containing `@typescript-eslint/ban-types`
- Fix: Delete the entire comment line

---

### 6. svelte/no-reactive-literals (2 instances) ⭐ QUICK WIN

**Severity:** Low - Code Quality
**Effort:** Low
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-literals/

**Description:**
Reports assignment of static, unchanging values within reactive statements because they're unnecessary.

**Why This Matters:**

- Wastes runtime cycles checking for changes
- Makes code confusing (appears reactive when it's not)
- Simple code quality issue

**Affected Files:**

- `src/lib/components/data-encoder-settings.svelte` (line 40)
- `src/lib/holocene/combobox/async-test.svelte` (line 13)

**Fix:**
Move static assignments outside of reactive statements.

```svelte
<!-- Bad -->
<script>
  $: foo = 'static value';
</script>

<!-- Good -->
<script>
  const foo = 'static value';
</script>
```

---

**🤖 AI FIXABILITY: HIGH (Automatic)**

**PROMPT FOR AI:**

```
Read these files:
1. src/lib/components/data-encoder-settings.svelte (line 40)
2. src/lib/holocene/combobox/async-test.svelte (line 13)

Find reactive statements ($:) that assign literal values (strings, numbers, booleans, arrays, objects) that never change.
Example patterns to find:
- $: foo = 'string';
- $: bar = 123;
- $: baz = true;

Convert these to regular const declarations:
- const foo = 'string';
- const bar = 123;
- const baz = true;

Do NOT change reactive statements that depend on other variables or have complex logic.
```

**REQUIRED CONTEXT:**

- Files:
  - `src/lib/components/data-encoder-settings.svelte` around line 40
  - `src/lib/holocene/combobox/async-test.svelte` around line 13
- Pattern to find: `$: variableName = literalValue;`
- Pattern to replace: `const variableName = literalValue;`

---

### 7. svelte/infinite-reactive-loop (2 instances) ⚠️ COMPLEX

**Severity:** Critical - Application Stability
**Effort:** Medium-High per instance
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/infinite-reactive-loop/

**Description:**
Detects situations where updating state in reactive statements could cause infinite loops, especially with async operations across different microtasks.

**Why This Matters:**

- Can freeze the application
- Causes performance degradation
- May lead to browser crashes in severe cases
- Critical stability issue

**Affected Files:**

- `src/lib/components/event/metadata-decoder.svelte` (2 instances at lines 53, 60)

**Fix:**
Review reactive logic to prevent circular dependencies. Add guards or restructure code.

```svelte
<!-- Bad -->
<script>
  let count = $state(0);
  $effect(() => {
    count = count + 1; // Infinite loop!
  });
</script>

<!-- Good -->
<script>
  let count = $state(0);
  let initialized = false;
  $effect(() => {
    if (!initialized) {
      count = count + 1;
      initialized = true;
    }
  });
</script>
```

---

**🤖 AI FIXABILITY: LOW (Manual Review Required)**

**PROMPT FOR AI:**

```
Read src/lib/components/event/metadata-decoder.svelte completely, paying special attention to lines 53 and 60.

Analyze the reactive logic and identify:
1. What variables are being read in the reactive statement
2. What variables are being written in the reactive statement
3. If any written variables are also being read (circular dependency)
4. If there's async code that updates reactive state

For each infinite loop:
- Explain what's causing the loop
- Suggest one of these fixes:
  a) Add a guard condition to prevent re-execution
  b) Use a different reactivity pattern (derived state instead of effect)
  c) Move the update outside the reactive context
  d) Use untrack() to break the reactive dependency

Provide the full refactored code with clear comments explaining the fix.
```

**REQUIRED CONTEXT:**

- File: `src/lib/components/event/metadata-decoder.svelte` (FULL FILE)
- Understanding of: Component's purpose, data flow, when effects should run
- Need: Business logic context to determine correct fix
- Warning: Cannot be fixed without understanding the intended behavior

---

### 8. svelte/no-at-html-tags (2 instances) ⚠️ SECURITY CRITICAL

**Severity:** Critical - Security (XSS)
**Effort:** Medium per instance
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-html-tags/

**Description:**
Warns about `{@html}` usage which can lead to XSS (Cross-Site Scripting) attacks if used with unsanitized user input.

**Why This Matters:**

- Major security vulnerability
- Can allow attackers to execute arbitrary JavaScript
- Critical for production applications
- May violate security compliance requirements

**Affected Files:**

- `src/lib/components/schedule/schedule-frequency.svelte` (line 28)
- `src/lib/components/schedule/schedules-table-row.svelte` (line 94)

**Fix:**
Ensure HTML is sanitized or use safer alternatives.

```svelte
<!-- Good -->
<script>
  import { sanitizeHtml } from '$lib/utilities/sanitize';
  const safeContent = sanitizeHtml(userContent);
</script>

<!-- Bad (if content is user-generated) -->
{@html userContent}
{@html safeContent}

<!-- Or avoid {@html} entirely -->
<div>{plainTextContent}</div>
```

---

**🤖 AI FIXABILITY: LOW-MEDIUM (Security Audit Required)**

**PROMPT FOR AI:**

```
Read these files:
1. src/lib/components/schedule/schedule-frequency.svelte (line 28)
2. src/lib/components/schedule/schedules-table-row.svelte (line 94)

For each {@html} usage, analyze:
1. What is the source of the HTML content?
2. Is it user-generated content or from an external API?
3. Is it already sanitized?
4. Is there a sanitization utility in the codebase? (search for sanitize, DOMPurify, or similar)

For each instance:
- If content is static/trusted: Add a comment explaining why it's safe
- If content is from API: Check if API sanitizes, add sanitization wrapper if not
- If content is user-generated: MUST add sanitization

Search the codebase for existing sanitization utilities in src/lib/utilities/ or similar.
If none exist, check if there's a dependency on DOMPurify or similar library.
If no sanitization exists, recommend adding it and provide implementation.
```

**REQUIRED CONTEXT:**

- Files:
  - `src/lib/components/schedule/schedule-frequency.svelte` (FULL FILE)
  - `src/lib/components/schedule/schedules-table-row.svelte` (FULL FILE)
- Need to understand: Data source, existing sanitization utilities
- Search codebase for: `sanitize`, `DOMPurify`, `escape`, `hast-util-sanitize`
- Warning: Security-critical, needs manual security review

---

### 9. svelte/prefer-svelte-reactivity (3 instances)

**Severity:** High - Reactivity Bugs
**Effort:** Medium per instance
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-svelte-reactivity/

**Description:**
Disallows mutable instances of built-in classes (Date, Map, Set) where Svelte's reactive alternatives should be used for proper reactivity.

**Why This Matters:**

- Built-in classes don't trigger Svelte reactivity
- Mutations won't update the UI
- Can cause subtle bugs where UI doesn't reflect state

**Affected Files:**

- `src/lib/components/lines-and-dots/end-time-interval.svelte` (Date instance, line 13)
- `src/lib/components/workflow/relationships/workflow-family-tree.svelte` (Map instance, line 29)
- `src/lib/holocene/vertical-nav/vertical-nav.svelte` (Map instance, line 47)

**Fix:**
Use Svelte's reactive alternatives from `svelte/reactivity`.

```svelte
<!-- Bad -->
<script>
  let myMap = new Map();
  let myDate = new Date();
</script>

<!-- Good -->
<script>
  import { SvelteMap, SvelteDate } from 'svelte/reactivity';
  let myMap = new SvelteMap();
  let myDate = new SvelteDate();
</script>
```

---

**🤖 AI FIXABILITY: MEDIUM (Pattern-based with testing)**

**PROMPT FOR AI:**

```
Read these files:
1. src/lib/components/lines-and-dots/end-time-interval.svelte (line 13)
2. src/lib/components/workflow/relationships/workflow-family-tree.svelte (line 29)
3. src/lib/holocene/vertical-nav/vertical-nav.svelte (line 47)

For each file:
1. Find the line with new Date(), new Map(), or new Set()
2. Check if it's in a reactive context (let statement, $state, etc.)
3. Add import at top: import { SvelteMap, SvelteDate, SvelteSet } from 'svelte/reactivity';
4. Replace:
   - new Map() → new SvelteMap()
   - new Date() → new SvelteDate()
   - new Set() → new SvelteSet()

Important: SvelteMap/SvelteSet/SvelteDate are drop-in replacements with the same API.
All existing methods (.set(), .get(), .getTime(), etc.) will work the same.

After replacement, check if the same Map/Set/Date variable is used elsewhere in the file
and ensure all usage patterns are compatible (they should be).
```

**REQUIRED CONTEXT:**

- Files (FULL):
  - `src/lib/components/lines-and-dots/end-time-interval.svelte`
  - `src/lib/components/workflow/relationships/workflow-family-tree.svelte`
  - `src/lib/holocene/vertical-nav/vertical-nav.svelte`
- Pattern: `new Map()` → `new SvelteMap()`
- Pattern: `new Date()` → `new SvelteDate()`
- Add import: `import { SvelteMap, SvelteDate, SvelteSet } from 'svelte/reactivity';`
- Note: Should be backward compatible, but test UI behavior after change

---

### 10. svelte/no-navigation-without-resolve (5 instances)

**Severity:** High - Potential Bugs
**Effort:** Low per instance
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-resolve/

**Description:**
Warns about `goto()` calls without `resolve()` which can cause navigation issues in SvelteKit.

**Why This Matters:**

- Can cause navigation to fail or behave unexpectedly
- May lead to stale data or incorrect routing state
- Critical for proper SvelteKit navigation behavior

**Affected Files:**

- `src/lib/stores/schedules.ts` (2 instances at lines 171, 263)
- `src/lib/utilities/update-query-parameters.ts` (2 instances at lines 65, 113)

**Fix:**
Await or properly resolve navigation promises.

```typescript
// Bad
goto('/some-path');

// Good
await goto('/some-path');
// or
goto('/some-path').then(() => {
  /* handle */
});
```

---

**🤖 AI FIXABILITY: MEDIUM (Context-dependent)**

**PROMPT FOR AI:**

```
Read these files:
1. src/lib/stores/schedules.ts (lines 171, 263)
2. src/lib/utilities/update-query-parameters.ts (lines 65, 113)

For each goto() call without await:

1. Check if the function is async:
   - If YES and no return value needed: Add 'await' before goto()
   - If NO: Make the function async and add 'await'

2. If the function cannot be async (e.g., event handlers, stores):
   - Add .then() handler: goto(url).then(() => { /* handle success */ });
   - Or add error handling: goto(url).catch(error => console.error(error));

3. Check context:
   - If in a store/action: Use void goto(url) to explicitly ignore promise
   - If in async flow: Use await
   - If error handling needed: Use .then()/.catch()

Provide the fix with context about why that pattern was chosen.
```

**REQUIRED CONTEXT:**

- Files with context around the lines:
  - `src/lib/stores/schedules.ts` (30 lines before/after lines 171, 263)
  - `src/lib/utilities/update-query-parameters.ts` (30 lines before/after lines 65, 113)
- Need to understand: Is function async? Is this in a store? Is error handling needed?
- Check if goto is imported from: `import { goto } from '$app/navigation';`

---

### 11. svelte/no-immutable-reactive-statements (9 instances)

**Severity:** Medium - Performance/Code Quality
**Effort:** Low per instance
**Rule Docs:** https://sveltejs.github.io/eslint-plugin-svelte/rules/no-immutable-reactive-statements/

**Description:**
Warns when reactive statements (`$:`) only reference immutable variables. These statements will never re-execute and shouldn't be reactive.

**Why This Matters:**

- Unnecessary reactive statements add runtime overhead
- Makes code harder to understand (appears reactive when it's not)
- Can mislead developers about when code executes

**Affected Files:**

- `src/lib/components/data-encoder-settings.svelte` (line 40)
- `src/lib/components/lines-and-dots/event-classification-filter.svelte` (line 10)
- `src/lib/components/lines-and-dots/svg/workflow-row.svelte` (line 17)
- `src/lib/components/schedule/schedules-calendar-view.svelte` (line 46)
- `src/lib/components/search-attribute-filter/list-filter.svelte` (line 19)
- `src/lib/components/workflow-raw-history-link.svelte` (line 10)
- `src/lib/components/workflow/search-attribute-filter/index.svelte` (line 12)
- `src/lib/components/workflow/workflows-summary-configurable-table/table-header-row.svelte` (line 34)
- `src/lib/holocene/combobox/async-test.svelte` (line 13)

**Fix:**
Remove `$:` and use regular assignments or derived state for immutable values.

```svelte
<!-- Bad -->
<script>
  const foo = 'bar';
  $: result = foo.toUpperCase(); // Never re-runs
</script>

<!-- Good -->
<script>
  const foo = 'bar';
  const result = foo.toUpperCase(); // Regular assignment
</script>

<!-- OR if it looks reactive but isn't -->
<script>
  import { someConst } from './constants';
  $: derived = someConst * 2; // someConst never changes
</script>

<!-- Good -->
<script>
  import { someConst } from './constants';
  const derived = someConst * 2;
</script>
```

---

**🤖 AI FIXABILITY: MEDIUM-HIGH (Pattern-based)**

**PROMPT FOR AI:**

```
Read these files and locate the specified lines:
1. src/lib/components/data-encoder-settings.svelte (line 40)
2. src/lib/components/lines-and-dots/event-classification-filter.svelte (line 10)
3. src/lib/components/lines-and-dots/svg/workflow-row.svelte (line 17)
4. src/lib/components/schedule/schedules-calendar-view.svelte (line 46)
5. src/lib/components/search-attribute-filter/list-filter.svelte (line 19)
6. src/lib/components/workflow-raw-history-link.svelte (line 10)
7. src/lib/components/workflow/search-attribute-filter/index.svelte (line 12)
8. src/lib/components/workflow/workflows-summary-configurable-table/table-header-row.svelte (line 34)
9. src/lib/holocene/combobox/async-test.svelte (line 13)

For each line with a reactive statement ($:):
1. Analyze all variables referenced on the right side
2. Determine if they are all immutable (const, imported constants, props that never change)
3. If ALL variables are immutable:
   - Remove the $: prefix
   - Change to const declaration
   - If it's a computed value, make it a simple const assignment

Example transformations:
$: computed = constValue * 2;  →  const computed = constValue * 2;
$: result = prop.toUpperCase(); → const result = prop.toUpperCase(); (if prop is const)

Be careful:
- Keep $: if ANY variable might change (let, $state, props, stores)
- Only remove $: when you're certain all dependencies are immutable
```

**REQUIRED CONTEXT:**

- Files (with full script context to see variable declarations):
  - All 9 files listed above
- For each file, need to see:
  - All variable declarations before the reactive statement
  - All imports
  - All props declarations
- Pattern: `$: result = immutableValue;` → `const result = immutableValue;`
- Warning: Only safe if all referenced variables are truly immutable

---

## Priority Recommendations

### Quick Wins (Start Here - 8 instances total):

1. ⭐ **svelte/no-useless-mustaches** (1) - AI: HIGH - Simple pattern removal
2. ⭐ **svelte/require-store-reactive-access** (1) - AI: HIGH - Add $ prefix
3. ⭐ **import/order** (1) - AI: HIGH - Remove empty line
4. ⭐ **no-undef** (1) - AI: MEDIUM - Add type reference
5. ⭐ **@typescript-eslint/ban-types** (2) - AI: HIGH - Remove comments
6. ⭐ **svelte/no-reactive-literals** (2) - AI: HIGH - Change $: to const

### High Priority Fixes (9 instances total):

7. **svelte/no-immutable-reactive-statements** (9) - AI: MEDIUM-HIGH - Pattern-based, needs validation
8. **svelte/no-navigation-without-resolve** (5) - AI: MEDIUM - Add await/then
9. **svelte/prefer-svelte-reactivity** (3) - AI: MEDIUM - Replace with Svelte classes

### Critical Issues (Require Manual Review - 4 instances):

10. ⚠️ **svelte/infinite-reactive-loop** (2) - AI: LOW - Needs deep logic understanding
11. ⚠️ **svelte/no-at-html-tags** (2) - AI: LOW-MEDIUM - Security audit required

---

## AI-Assisted Fix Strategy

### Phase 1: Automated Fixes (1-2 hours with AI)

Can be fixed with high confidence using AI with the prompts above:

- [ ] Fix useless mustaches (1 file)
- [ ] Fix store access (1 file)
- [ ] Fix import order (1 file)
- [ ] Fix ban-types comments (2 files)
- [ ] Fix reactive literals (2 files)
      Total: **7 instances - AI Fixability: HIGH**

### Phase 2: AI-Assisted with Testing (2-4 hours)

AI can fix but requires testing to verify:

- [ ] Fix immutable reactive statements (9 files) - Test reactivity
- [ ] Fix navigation without resolve (2 files) - Test navigation flows
- [ ] Fix prefer-svelte-reactivity (3 files) - Test reactive updates
- [ ] Fix no-undef (1 file) - Test TypeScript compilation
      Total: **15 instances - AI Fixability: MEDIUM**

### Phase 3: Manual Review Required (4-8 hours)

Requires human understanding and security review:

- [ ] Fix infinite reactive loops (1 file, 2 instances) - Deep logic analysis
- [ ] Audit {@html} usage (2 files) - Security review + sanitization
      Total: **4 instances - AI Fixability: LOW**

---

## Testing Checklist

After fixes:

- [ ] Run `pnpm eslint` - should show 0 errors
- [ ] Run `pnpm check` - TypeScript should pass
- [ ] Run `pnpm test` - Unit tests should pass
- [ ] Test navigation flows (schedules, query parameters)
- [ ] Test reactive components (metadata decoder, workflow family tree)
- [ ] Verify schedule display components render correctly
- [ ] Security audit of all `{@html}` usage
- [ ] Test with real data to ensure reactivity works

---

## Notes

- All rules are currently set to `warn` to avoid blocking development
- No functionality should be broken by current warnings
- These issues were surfaced by ESLint 9's improved Svelte linting
- Recommend addressing critical/high priority issues before next release
- AI can handle **78% of issues** (22 out of 28) with medium-high confidence
- **22% of issues** (6 out of 28) require manual review due to security/complexity
