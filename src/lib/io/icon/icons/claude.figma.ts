// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2058-7271
// source=src/lib/io/icon/icons/claude.svelte
// component=IconClaude
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconClaude />`,
  imports: ["import { IconClaude } from '$lib/io/icon';"],
  id: 'icon-claude',
  metadata: { nestable: true, props: { componentName: 'IconClaude' } },
};
