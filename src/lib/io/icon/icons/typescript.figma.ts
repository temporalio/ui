// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=4079-64972
// source=src/lib/io/icon/icons/typescript.svelte
// component=IconTypescript
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconTypescript />`,
  imports: ["import { IconTypescript } from '$lib/io/icon';"],
  id: 'icon-typescript',
  metadata: { nestable: true, props: { componentName: 'IconTypescript' } },
};
