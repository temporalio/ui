// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12797
// source=src/lib/io/icon/icons/robot.svelte
// component=IconRobot
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconRobot />`,
  imports: ["import { IconRobot } from '$lib/io/icon';"],
  id: 'icon-robot',
  metadata: { nestable: true, props: { componentName: 'IconRobot' } },
};
