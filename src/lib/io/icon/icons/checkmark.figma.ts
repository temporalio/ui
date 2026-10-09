// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=908-12622
// source=src/lib/io/icon/icons/checkmark.svelte
// component=IconCheckmark
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconCheckmark />`,
  imports: ["import { IconCheckmark } from '$lib/io/icon';"],
  id: 'icon-checkmark',
  metadata: { nestable: true, props: { componentName: 'IconCheckmark' } },
};
