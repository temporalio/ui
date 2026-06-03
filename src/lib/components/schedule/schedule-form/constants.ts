import {
  HOURS,
  MINUTES,
  SECONDS,
  type Unit,
} from '$lib/holocene/duration-input/duration-input.svelte';

import type { ScheduleFormData } from './schema';

type OverlapPolicy = ScheduleFormData['overlapPolicy'];

export const overlapPolicyContent: Record<
  OverlapPolicy,
  { isDefault?: boolean; label: string; description: string }
> = {
  Skip: {
    isDefault: true,
    label: 'Skip',
    description:
      'Workflow Executions are not started when a previously started Workflow Execution started by this schedule is already running.',
  },
  BufferOne: {
    label: 'Buffer One',
    description:
      'Starts the Workflow Execution as soon as the current one completes. Limited to one.',
  },
  BufferAll: {
    label: 'Buffer All',
    description:
      'Allows an unlimited number of Workflows to buffer; Workflows start in order they were added to buffer.',
  },
  CancelOther: {
    label: 'Cancel Other',
    description:
      'Cancels currently running Workflow Execution, starts new one after cancellation completes.',
  },
  TerminateOther: {
    label: 'Terminate Other',
    description:
      'Terminates currently running Workflow Execution, starts new one immediately.',
  },
  AllowAll: {
    label: 'Allow All',
    description:
      'Starts any number of concurrent Workflow Executions; more than one Workflow Execution can run simultaneously.',
  },
};

const MONTHS: Unit<'month(s)'> = {
  label: 'month(s)',
  convert: (n: number) => n * 31 * 24 * 60 * 60,
};

const DAYS: Unit<'day(s)'> = {
  label: 'day(s)',
  convert: (n: number) => n * 24 * 60 * 60,
};

export const durationUnits = [MONTHS, DAYS, HOURS, MINUTES, SECONDS];
