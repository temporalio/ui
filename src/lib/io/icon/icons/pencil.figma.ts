// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12765
// source=src/lib/io/icon/icons/pencil.svelte
// component=IconPencil
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconPencil />`,
  imports: ["import { IconPencil } from '$lib/io/icon';"],
  id: 'icon-pencil',
  metadata: { nestable: true, props: { componentName: 'IconPencil' } },
};
