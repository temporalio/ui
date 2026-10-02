// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12772
// source=src/lib/io/icon/icons/overview.svelte
// component=IconOverview
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconOverview />`,
  imports: ["import { IconOverview } from '$lib/io/icon';"],
  id: 'icon-overview',
  metadata: { nestable: true, props: { componentName: 'IconOverview' } },
};
