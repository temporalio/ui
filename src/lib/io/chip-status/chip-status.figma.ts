// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2767-159048
// source=src/lib/io/chip-status/chip-status.svelte
// component=ChipStatus
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

const instance = figma.selectedInstance;

const status = instance.getEnum('status', {
  Running: 'Running',
  Paused: 'Paused',
  Completed: 'Completed',
  ContinuedAsNew: 'ContinuedAsNew',
  Failed: 'Failed',
  TimedOut: 'TimedOut',
  Terminated: 'Terminated',
  Canceled: 'Canceled',
});
const extension = instance.getBoolean('showExtension')
  ? instance.getString('extension')
  : undefined;

export default {
  example: figma.code`<ChipStatus status="${status}"${
    extension ? figma.code` extension="${extension}"` : ''
  } />`,
  imports: ["import { ChipStatus } from '$lib/io/chip-status';"],
  id: 'chip-status',
  metadata: { nestable: true },
};
