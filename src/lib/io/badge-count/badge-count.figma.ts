// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=1437-14757
// source=src/lib/io/badge-count/badge-count.svelte
// component=BadgeCount
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

const instance = figma.selectedInstance;

const value = instance.getString('value');
const showTotal = instance.getEnum('type', { Count: false, Total: true });
const total =
  showTotal && instance.getBoolean('showTotal')
    ? instance.getString('total')
    : undefined;

export default {
  example: figma.code`<BadgeCount value="${value}"${
    total ? figma.code` total="${total}"` : ''
  } />`,
  imports: ["import { BadgeCount } from '$lib/io/badge-count';"],
  id: 'badge-count',
  metadata: { nestable: true },
};
