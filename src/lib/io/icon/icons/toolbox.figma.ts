// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12846
// source=src/lib/io/icon/icons/toolbox.svelte
// component=IconToolbox
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconToolbox />`,
  imports: ["import { IconToolbox } from '$lib/io/icon';"],
  id: 'icon-toolbox',
  metadata: { nestable: true, props: { componentName: 'IconToolbox' } },
};
