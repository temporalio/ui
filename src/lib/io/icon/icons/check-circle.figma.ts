// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=908-12633
// source=src/lib/io/icon/icons/check-circle.svelte
// component=IconCheckCircle
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconCheckCircle />`,
  imports: ["import { IconCheckCircle } from '$lib/io/icon';"],
  id: 'icon-check-circle',
  metadata: { nestable: true, props: { componentName: 'IconCheckCircle' } },
};
