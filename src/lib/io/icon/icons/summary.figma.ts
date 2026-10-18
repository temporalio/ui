// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12812
// source=src/lib/io/icon/icons/summary.svelte
// component=IconSummary
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconSummary />`,
  imports: ["import { IconSummary } from '$lib/io/icon';"],
  id: 'icon-summary',
  metadata: { nestable: true, props: { componentName: 'IconSummary' } },
};
