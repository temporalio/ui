export type Deployment = Step[];

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
  expectedStartTime: string;
  startTime: string;
  endTime: string;

  target_cell: string;
}

export const deployment: Step[] = [
  {
    id: '1',
    type: StepType.CONFIG,
    status: StepStatus.COMPLETED,
    expectedStartTime: '2024-06-11 UTC 15:30:00.00',
    startTime: '2024-06-11 UTC 15:30:00.00',
    endTime: '2024-06-11 UTC 16:30:00.00',
    target_cell: 'cell1',
  },
  {
    id: '2',
    type: StepType.DEPLOYMENT,
    status: StepStatus.FAILED,
    expectedStartTime: '2024-06-11 UTC 15:30:00.00',
    startTime: '2024-06-11 UTC 15:45:03.00',
    endTime: '2024-06-11 UTC 16:36:39.00',
    target_cell: 'cell2',
  },
  {
    id: '3',
    type: StepType.RESTART,
    status: StepStatus.IN_PROGRESS,
    expectedStartTime: '2024-06-11 UTC 16:45:00.00',
    startTime: '2024-06-11 UTC 16:45:00.00',
    endTime: '',
    target_cell: 'cell3',
  },
  {
    id: '4',
    type: StepType.DEPLOYMENT,
    status: StepStatus.SCHEDULED,
    expectedStartTime: '2024-06-11 UTC 20:50:00.00',
    startTime: '',
    endTime: '',
    target_cell: 'cell4',
  },
  {
    id: '5',
    type: StepType.DEPLOYMENT,
    status: StepStatus.SCHEDULED,
    expectedStartTime: '2024-06-11 UTC 21:30:00.00',
    startTime: '',
    endTime: '',
    target_cell: 'cell5',
  },
  {
    id: '6',
    type: StepType.DEPLOYMENT,
    status: StepStatus.SCHEDULED,
    expectedStartTime: '2024-06-11 UTC 22:30:00.00',
    startTime: '',
    endTime: '',
    target_cell: 'cell6',
  },
  {
    id: '7',
    type: StepType.DEPLOYMENT,
    status: StepStatus.SCHEDULED,
    expectedStartTime: '2024-06-11 UTC 23:30:00.00',
    startTime: '',
    endTime: '',
    target_cell: 'cell7',
  },
  {
    id: '8',
    type: StepType.DEPLOYMENT,
    status: StepStatus.SCHEDULED,
    expectedStartTime: '2024-06-11 UTC 23:50:00.00',
    startTime: '',
    endTime: '',
    target_cell: 'cell8',
  },
];
