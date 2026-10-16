// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=1909-28596
// source=src/lib/io/icon/icons/x.svelte
// component=IconX
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconX />`,
  imports: ["import { IconX } from '$lib/io/icon';"],
  id: 'icon-x',
  metadata: { nestable: true, props: { componentName: 'IconX' } },
};
