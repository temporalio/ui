// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2058-7275
// source=src/lib/io/icon/icons/codex.svelte
// component=IconCodex
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconCodex />`,
  imports: ["import { IconCodex } from '$lib/io/icon';"],
  id: 'icon-codex',
  metadata: { nestable: true, props: { componentName: 'IconCodex' } },
};
