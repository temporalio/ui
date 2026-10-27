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
- `ComponentPage` defaults to Playground, Examples, Usage, and API reference. Pass `sections` to customize the links and keep each ID aligned with its target section.
- Keep Ark Table of Contents navigation in the sticky right column on wide screens and above the content on smaller screens. Preserve active-section styling, keyboard access, and stable reading position (`autoScroll={false}`).
- Keep runnable examples in `src/examples`. Import their source with `?raw` so displayed example code matches what is rendered. Playground source must track the selected props.
- Keep component names, descriptions, examples guidance, usage, and API reference in `static/components/<slug>.md`. These are plain Markdown files, served at `/components/<slug>.md` and rendered by the interactive pages. Do not duplicate that prose or API data in Svelte or TypeScript.
- Start Markdown with a level-one component name and a description paragraph, followed by `## Examples`, `## Usage`, and `## API reference`. Use level-three headings for usage topics and component API tables. Keep prose simple and direct.
- `parseComponentMarkdown` reads the Markdown using the existing Markdown parser and sanitizer. `MarkdownContent` renders prose, code fences through `SourceCode`, and API tables through `PropsTable`. API table columns are `Prop`, `Type`, `Default`, and `Description`; escape union pipes as `\|`.
- Keep live playgrounds and runnable examples in Svelte. Markdown code fences provide standalone usage examples. Register parsed metadata in `src/data/components.ts` and use the parsed sections in the page.

## Reuse and boundaries

- Prefer io-ark components for the docs interface when available, including Button and ButtonLink from `$lib/io-ark/button`. Reuse existing Holocene/io components for controls that do not yet have an io-ark equivalent, such as inputs, labels, selects, checkboxes, tables, and badges.
- Use `SelectControl` for labeled typed option controls. Preserve label associations and unique control IDs.
- Render the documented io-ark component in its examples and playground. Reusing Holocene/io for the docs interface does not permit legacy counterpart dependencies inside io-ark implementations; follow `src/lib/io-ark/AGENTS.md` for those files.
- Share theme tokens and Tailwind configuration. The docs Tailwind configuration must also support preprocessing imported Holocene styles.
- Keep this app standalone: do not require a Temporal server or add docs routes to the product UI.
- The docs TypeScript configuration includes the shared ambient declarations and uses generic SvelteKit route types. Imported product types can refer to routes absent from the docs app; the main UI project checks those product routes.

## Validation

- Run `pnpm docs:check`, `pnpm docs:build`, and targeted ESLint and Prettier checks after code changes.
- Verify changed controls, generated code, code copying, section navigation, and relevant theme/responsive states in the browser. Do not replace the actual shared components with docs-only lookalikes to make a check pass.
