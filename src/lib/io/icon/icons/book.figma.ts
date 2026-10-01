// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=908-12614
// source=src/lib/io/icon/icons/book.svelte
// component=IconBook
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconBook />`,
  imports: ["import { IconBook } from '$lib/io/icon';"],
  id: 'icon-book',
  metadata: { nestable: true, props: { componentName: 'IconBook' } },
};
