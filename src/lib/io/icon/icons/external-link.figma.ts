// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=910-12676
// source=src/lib/io/icon/icons/external-link.svelte
// component=IconExternalLink
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconExternalLink />`,
  imports: ["import { IconExternalLink } from '$lib/io/icon';"],
  id: 'icon-external-link',
  metadata: { nestable: true, props: { componentName: 'IconExternalLink' } },
};
