# Component documentation

## Audience and content

- Write component pages for consumers: when to use the component, realistic examples, props, events/snippets, native behavior, and accessibility guidance.
- Keep migration procedures, legacy implementation comparisons, and Ark implementation details in agent instructions rather than usage pages or READMEs. Add consumer-facing upgrade guidance only when an actual consumer change requires it.
- Keep READMEs focused on setup, commands, and contributor orientation. Keep these instructions as the source of agent-specific implementation guidance.

## Shared page structure

- The root layout owns the header, theme toggle, component navigation, and main landmark. Do not duplicate the shell in individual pages.
- Register component metadata in `src/data/components.ts` and its `components` array. Create the page under `src/routes/components/<slug>/+page.svelte`.
- Use `$docs/components/component-page.svelte` for metadata, page heading, section navigation, and footer. Use `Playground`, `DocSection`, `SourceCode`, and `PropsTable` for their shared structures.
- Keep component-specific state, bindings, examples, and guidance in the page. Supply `preview` and `controls` snippets to `Playground`.
- `ComponentPage` defaults to Playground, Anatomy (when documented), Examples, Usage, and API reference. Render `<AnatomySection slug="<slug>" />` between the Playground and Examples sections, and `<ContractSection slug="<slug>" />` between Usage and API reference. Pass `sections` to customize the links and keep each ID aligned with its target section.
- Keep Ark Table of Contents navigation in the sticky right column on wide screens and above the content on smaller screens. Preserve active-section styling, keyboard access, and stable reading position (`autoScroll={false}`).
- Keep runnable examples in `src/examples`. Import their source with `?raw` so displayed example code matches what is rendered. Playground source must track the selected props.
- Keep component names, descriptions, examples guidance, usage, and API reference in `static/components/<slug>.md`. These are plain Markdown files, served at `/components/<slug>.md` and rendered by the interactive pages. Do not duplicate that prose or API data in Svelte or TypeScript.
- Start Markdown with a level-one component name and a description paragraph, followed by `## Anatomy`, `## Examples`, `## Usage`, and `## API reference`.
- Component contracts are not part of the docs Markdown. They live next to the component as `src/lib/io-ark/<folder>/<slug>.contract.md` (see `src/lib/io-ark/CONTRIBUTING.md`), and `ContractSection` renders them from there: rules in the open, Known gaps, Review candidates, Decisions and the Reconciliation log collapsed under Maintainer notes. End the docs Usage section with a short `### Contract` pointer to the file.
- Write `## Anatomy` as one short sentence and a nested bullet list. Each item is `- **Part name** `selector` (side): One-sentence description.` The first item is the root and gets a dotted outline. `selector` points at the element in the anatomy preview: a bare word means `[data-part="word"]`, anything else is a CSS selector. `(side)` is optional (`top`, `right`, `bottom`, `left`); omit it to place the label automatically. Parts without a selector are listed but not drawn. Use sentence-case words for names ("Item trigger"), not PascalCase.
- Pass a `preview` snippet to `AnatomySection` that renders the real component in a representative static state (open overlays inline with `portalled={false}` and non-modal, so they do not trap focus or cover the page). The preview is inert, and small components are scaled up automatically. The figure lists every part beside the diagram (hover or focus maps a part to its area) and generates the Structure code block from the preview's Ark `data-scope`/`data-part` elements, so render the optional parts you want to appear there. Callout 4–7 parts; list the rest without selectors. Add `data-part` to a Temporal-only region only when it has no other stable hook.
- `parseComponentMarkdown` reads the Markdown using the existing Markdown parser and sanitizer. `MarkdownContent` renders prose, code fences through `SourceCode`, and API tables through `PropsTable`. API table columns are `Prop`, `Type`, `Default`, and `Description`; escape union pipes as `\|`.
- Keep live playgrounds and runnable examples in Svelte. Markdown code fences provide standalone usage examples. Register parsed metadata in `src/data/components.ts` and use the parsed sections in the page.

## Reuse and boundaries

- Prefer io-ark components for the docs interface when available, including Button and ButtonLink from `$lib/io-ark/button`. Reuse existing Holocene/io components for controls that do not yet have an io-ark equivalent, such as inputs, labels, selects, checkboxes, tables, and badges.
- Use `SelectControl` for labeled typed option controls. Preserve label associations and unique control IDs.
- Render the documented io-ark component in its examples and playground. Reusing Holocene/io for the docs interface does not permit legacy counterpart dependencies inside io-ark implementations; follow `src/lib/io-ark/CONTRIBUTING.md` for those files.
- Share theme tokens and Tailwind configuration. The docs Tailwind configuration must also support preprocessing imported Holocene styles.
- Keep this app standalone: do not require a Temporal server or add docs routes to the product UI.
- The docs TypeScript configuration includes the shared ambient declarations and uses generic SvelteKit route types. Imported product types can refer to routes absent from the docs app; the main UI project checks those product routes.

## Validation

- Run `pnpm docs:check`, `pnpm docs:build`, and targeted ESLint and Prettier checks after code changes.
- Verify changed controls, generated code, code copying, section navigation, and relevant theme/responsive states in the browser. Do not replace the actual shared components with docs-only lookalikes to make a check pass.
