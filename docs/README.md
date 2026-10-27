# Component documentation

Run `pnpm docs:dev` from the repository root, then open
[Button documentation](http://localhost:6007/components/button).
The standalone SvelteKit app runs without a Temporal server.

- `pnpm docs:check` checks the documentation and the components it imports.
- `pnpm docs:build` generates the static site in `docs/build`.
- `pnpm docs:preview` serves the production build on port 6007.

Component pages live in `docs/src/routes/components`, runnable examples in
`docs/src/examples`, and shared documentation components in `docs/src/components`.
The app shares the repository's theme tokens, icons, and component source.

Component guidance and API tables are authored in plain Markdown:
[Button](static/components/button.md) and [Accordion](static/components/accordion.md).
The interactive pages render those same files alongside the live examples.
Each page has a “Copy page” button with a dropdown for “View as markdown”; the files are also available at
`/components/button.md` and `/components/accordion.md` when the docs are running.

Pages include live examples, copyable code, usage and accessibility guidance,
and an API reference. The section navigation sits on the right on wide screens
and above the content on smaller screens.

See [AGENTS.md](AGENTS.md) for page authoring conventions and validation guidance.
