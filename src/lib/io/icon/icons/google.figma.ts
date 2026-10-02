// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=1909-28618
// source=src/lib/io/icon/icons/google.svelte
// component=IconGoogle
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconGoogle />`,
  imports: ["import { IconGoogle } from '$lib/io/icon';"],
  id: 'icon-google',
  metadata: { nestable: true, props: { componentName: 'IconGoogle' } },
};
