// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12794
// source=src/lib/io/icon/icons/search.svelte
// component=IconSearch
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconSearch />`,
  imports: ["import { IconSearch } from '$lib/io/icon';"],
  id: 'icon-search',
  metadata: { nestable: true, props: { componentName: 'IconSearch' } },
};
