import type { Timestamp } from '$lib/types';

export interface Deployment {}

enum StepType {
  UNSPECIFIED = 0,
  CONFIG = 1,
  DEPLOYMENT = 2,
  RESTART = 3,
  USER_INPUT = 4,
}

enum StepStatus {
  UNSPECIFIED = 0,
  SCHEDULED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  FAILED = 4,
}

export interface Step {
  id: string;

  // Link to workflow?
  workflow_id?: string;
  run_id?: string;

  type: StepType;
  status: StepStatus;

  // For a future deployment this would be the only value
  expected_start_time: string | Timestamp;
  start_time: string | Timestamp;
  end_time: string | Timestamp;

  target_cell: string;
}

export const deployment: Step[] = [
  {
    id: '1',
    type: StepType.CONFIG,
    status: StepStatus.COMPLETED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '2',
    type: StepType.DEPLOYMENT,
    status: StepStatus.IN_PROGRESS,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '2024-07-01 UTC 12:30:00.00',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '3',
    type: StepType.RESTART,
    status: StepStatus.SCHEDULED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '4',
    type: StepType.USER_INPUT,
    status: StepStatus.FAILED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '5',
    type: StepType.USER_INPUT,
    status: StepStatus.SCHEDULED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '6',
    type: StepType.USER_INPUT,
    status: StepStatus.IN_PROGRESS,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '7',
    type: StepType.USER_INPUT,
    status: StepStatus.COMPLETED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
  {
    id: '8',
    type: StepType.USER_INPUT,
    status: StepStatus.UNSPECIFIED,
    expected_start_time: '2024-07-01 UTC 12:30:00.00',
    start_time: '',
    end_time: '',
    target_cell: 'cell1',
  },
];
