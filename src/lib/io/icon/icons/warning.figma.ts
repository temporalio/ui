// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12875
// source=src/lib/io/icon/icons/warning.svelte
// component=IconWarning
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconWarning />`,
  imports: ["import { IconWarning } from '$lib/io/icon';"],
  id: 'icon-warning',
  metadata: { nestable: true, props: { componentName: 'IconWarning' } },
};
