// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12850
// source=src/lib/io/icon/icons/trash.svelte
// component=IconTrash
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconTrash />`,
  imports: ["import { IconTrash } from '$lib/io/icon';"],
  id: 'icon-trash',
  metadata: { nestable: true, props: { componentName: 'IconTrash' } },
};
