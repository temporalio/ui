# Theme

Semantic theme tokens for color, spacing, and interaction states, and how to use
them.

IO components use semantic theme tokens for color, spacing, and interaction
states. Use the theme toolbar to preview components across the available
themes.

Import the theme preset from `@temporalio/ui/theme/preset` when configuring a
consuming application. Prefer semantic classes such as `text-primary`,
`bg-surface-primary`, and `border-primary` so components follow the selected
theme.

The token reference on the Storybook page is rendered directly from the theme
definitions, so changes to tokens, scales, and themes appear there
automatically.
