// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=910-12635
// source=src/lib/io/icon/icons/clock.svelte
// component=IconClock
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconClock />`,
  imports: ["import { IconClock } from '$lib/io/icon';"],
  id: 'icon-clock',
  metadata: { nestable: true, props: { componentName: 'IconClock' } },
};
