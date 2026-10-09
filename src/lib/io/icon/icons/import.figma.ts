// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12749
// source=src/lib/io/icon/icons/import.svelte
// component=IconImport
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconImport />`,
  imports: ["import { IconImport } from '$lib/io/icon';"],
  id: 'icon-import',
  metadata: { nestable: true, props: { componentName: 'IconImport' } },
};
