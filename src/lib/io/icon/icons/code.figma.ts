// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12752
// source=src/lib/io/icon/icons/code.svelte
// component=IconCode
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconCode />`,
  imports: ["import { IconCode } from '$lib/io/icon';"],
  id: 'icon-code',
  metadata: { nestable: true, props: { componentName: 'IconCode' } },
};
