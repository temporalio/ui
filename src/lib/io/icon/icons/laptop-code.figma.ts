// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12756
// source=src/lib/io/icon/icons/laptop-code.svelte
// component=IconLaptopCode
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconLaptopCode />`,
  imports: ["import { IconLaptopCode } from '$lib/io/icon';"],
  id: 'icon-laptop-code',
  metadata: { nestable: true, props: { componentName: 'IconLaptopCode' } },
};
