// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2058-7292
// source=src/lib/io/icon/icons/apple.svelte
// component=IconApple
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconApple />`,
  imports: ["import { IconApple } from '$lib/io/icon';"],
  id: 'icon-apple',
  metadata: { nestable: true, props: { componentName: 'IconApple' } },
};
