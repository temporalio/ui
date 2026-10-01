// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2058-7286
// source=src/lib/io/icon/icons/linux.svelte
// component=IconLinux
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconLinux />`,
  imports: ["import { IconLinux } from '$lib/io/icon';"],
  id: 'icon-linux',
  metadata: { nestable: true, props: { componentName: 'IconLinux' } },
};
