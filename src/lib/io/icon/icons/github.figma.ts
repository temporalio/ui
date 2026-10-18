// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2058-7282
// source=src/lib/io/icon/icons/github.svelte
// component=IconGithub
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

export default {
  example: figma.code`<IconGithub />`,
  imports: ["import { IconGithub } from '$lib/io/icon';"],
  id: 'icon-github',
  metadata: { nestable: true, props: { componentName: 'IconGithub' } },
};
