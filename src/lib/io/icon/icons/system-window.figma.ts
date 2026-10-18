// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12816
// source=src/lib/io/icon/icons/system-window.svelte
// component=IconSystemWindow
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconSystemWindow />`,
  imports: ["import { IconSystemWindow } from '$lib/io/icon';"],
  id: 'icon-system-window',
  metadata: { nestable: true, props: { componentName: 'IconSystemWindow' } },
};
