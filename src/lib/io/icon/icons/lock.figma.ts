// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12767
// source=src/lib/io/icon/icons/lock.svelte
// component=IconLock
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconLock />`,
  imports: ["import { IconLock } from '$lib/io/icon';"],
  id: 'icon-lock',
  metadata: { nestable: true, props: { componentName: 'IconLock' } },
};
