// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=910-12658
// source=src/lib/io/icon/icons/exclamation-circle.svelte
// component=IconExclamationCircle
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconExclamationCircle />`,
  imports: ["import { IconExclamationCircle } from '$lib/io/icon';"],
  id: 'icon-exclamation-circle',
  metadata: {
    nestable: true,
    props: { componentName: 'IconExclamationCircle' },
  },
};
