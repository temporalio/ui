// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12727
// source=src/lib/io/icon/icons/folders.svelte
// component=IconFolders
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconFolders />`,
  imports: ["import { IconFolders } from '$lib/io/icon';"],
  id: 'icon-folders',
  metadata: { nestable: true, props: { componentName: 'IconFolders' } },
};
