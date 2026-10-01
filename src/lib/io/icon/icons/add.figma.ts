// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=908-12603
// source=src/lib/io/icon/icons/add.svelte
// component=IconAdd
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconAdd />`,
  imports: ["import { IconAdd } from '$lib/io/icon';"],
  id: 'icon-add',
  metadata: { nestable: true, props: { componentName: 'IconAdd' } },
};
