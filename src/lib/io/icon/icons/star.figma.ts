// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=911-12810
// source=src/lib/io/icon/icons/star.svelte
// component=IconStar
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconStar />`,
  imports: ["import { IconStar } from '$lib/io/icon';"],
  id: 'icon-star',
  metadata: { nestable: true, props: { componentName: 'IconStar' } },
};
