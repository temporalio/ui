// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12754
// source=src/lib/io/icon/icons/keyboard.svelte
// component=IconKeyboard
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconKeyboard />`,
  imports: ["import { IconKeyboard } from '$lib/io/icon';"],
  id: 'icon-keyboard',
  metadata: { nestable: true, props: { componentName: 'IconKeyboard' } },
};
