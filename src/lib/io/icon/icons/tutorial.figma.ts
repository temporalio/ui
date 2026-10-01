// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12869
// source=src/lib/io/icon/icons/tutorial.svelte
// component=IconTutorial
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconTutorial />`,
  imports: ["import { IconTutorial } from '$lib/io/icon';"],
  id: 'icon-tutorial',
  metadata: { nestable: true, props: { componentName: 'IconTutorial' } },
};
