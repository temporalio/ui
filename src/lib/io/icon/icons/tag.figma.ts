// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12842
// source=src/lib/io/icon/icons/tag.svelte
// component=IconTag
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconTag />`,
  imports: ["import { IconTag } from '$lib/io/icon';"],
  id: 'icon-tag',
  metadata: { nestable: true, props: { componentName: 'IconTag' } },
};
