// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=910-12691
// source=src/lib/io/icon/icons/file-import.svelte
// component=IconFileImport
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconFileImport />`,
  imports: ["import { IconFileImport } from '$lib/io/icon';"],
  id: 'icon-file-import',
  metadata: { nestable: true, props: { componentName: 'IconFileImport' } },
};
