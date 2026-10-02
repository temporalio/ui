// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=910-12687
// source=src/lib/io/icon/icons/feather.svelte
// component=IconFeather
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconFeather />`,
  imports: ["import { IconFeather } from '$lib/io/icon';"],
  id: 'icon-feather',
  metadata: { nestable: true, props: { componentName: 'IconFeather' } },
};
