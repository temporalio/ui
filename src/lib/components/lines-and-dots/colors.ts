import { colorScales } from '$lib/theme/io/themes';
import type { EventClassification, EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

const DEFAULT_STROKE_COLOR = 'currentColor';

const WORKFLOW_ACTION_COLOR_VARIABLES = {
  workflow: 'var(--color-action-workflow-workflow)',
  activity: 'var(--color-action-workflow-activity)',
  signal: 'var(--color-action-workflow-signal)',
  timer: 'var(--color-action-workflow-timer)',
  nexus: 'var(--color-action-workflow-nexus)',
};

export const WORKFLOW_ACTION_HOVER_CLASSES = {
  workflow: 'border-action-workflow-workflow bg-action-workflow-workflow/80',
  activity: 'border-action-workflow-activity bg-action-workflow-activity/80',
  'child-workflow':
    'border-action-workflow-workflow bg-action-workflow-workflow/80',
  timer: 'border-action-workflow-timer bg-action-workflow-timer/80',
  signal: 'border-action-workflow-signal bg-action-workflow-signal/80',
  nexus: 'border-action-workflow-nexus bg-action-workflow-nexus/80',
  'local-activity':
    'border-action-workflow-activity bg-action-workflow-activity/80',
};

const STATUS_STROKE_COLORS: Record<
  NonNullable<WorkflowStatus> | EventClassification | 'Delayed',
  string
> = {
  Completed: colorScales.green[9],
  Failed: colorScales.red[11],
  Terminated: colorScales.red[11],
  Signaled: colorScales.pink[9],
  Fired: colorScales.tangerine[9],
  TimedOut: colorScales.persimmon[9],
  Canceled: colorScales.amber[9],
  Running: colorScales.blue[9],
  Delayed: colorScales.amber[9],
  ContinuedAsNew: DEFAULT_STROKE_COLOR,
  Paused: DEFAULT_STROKE_COLOR,
  Unspecified: DEFAULT_STROKE_COLOR,
  Scheduled: DEFAULT_STROKE_COLOR,
  Open: DEFAULT_STROKE_COLOR,
  New: DEFAULT_STROKE_COLOR,
  Started: DEFAULT_STROKE_COLOR,
  Initiated: DEFAULT_STROKE_COLOR,
  CancelRequested: DEFAULT_STROKE_COLOR,
};

export const getStatusStrokeColor = (
  status: WorkflowStatus | EventClassification | 'Delayed',
): string => (status && STATUS_STROKE_COLORS[status]) ?? DEFAULT_STROKE_COLOR;

const CATEGORY_STROKE_COLORS: Record<
  EventTypeCategory | 'pending' | 'retry' | 'marker' | 'command',
  string
> = {
  timer: WORKFLOW_ACTION_COLOR_VARIABLES.timer,
  signal: WORKFLOW_ACTION_COLOR_VARIABLES.signal,
  activity: WORKFLOW_ACTION_COLOR_VARIABLES.activity,
  workflow: WORKFLOW_ACTION_COLOR_VARIABLES.workflow,
  marker: colorScales.neutral[1],
  command: colorScales.neutral[1],
  'child-workflow': WORKFLOW_ACTION_COLOR_VARIABLES.workflow,
  update: colorScales.persimmon[8],
  pending: colorScales['slate-blue'][8],
  retry: colorScales.persimmon[8],
  'local-activity': WORKFLOW_ACTION_COLOR_VARIABLES.activity,
  nexus: WORKFLOW_ACTION_COLOR_VARIABLES.nexus,
  other: DEFAULT_STROKE_COLOR,
};

export const getCategoryStrokeColor = (
  category: EventTypeCategory | 'pending' | 'retry' | 'marker' | 'command',
): string => CATEGORY_STROKE_COLORS[category] ?? DEFAULT_STROKE_COLOR;

export type DotColors = { readonly fill: string; readonly stroke: string };

const DEFAULT_DOT_STROKE = colorScales.neutral[11];
const DOT_DEFAULT: DotColors = {
  fill: colorScales.indigo[3],
  stroke: DEFAULT_DOT_STROKE,
};

const CLASSIFICATION_DOT_COLORS: Record<string, DotColors> = {
  Started: {
    fill: colorScales.zaffre[7],
    stroke: DEFAULT_DOT_STROKE,
  },
  Completed: {
    fill: colorScales.green[9],
    stroke: colorScales.green[11],
  },
  Fired: {
    fill: colorScales.tangerine[9],
    stroke: colorScales.amber[9],
  },
  Signaled: {
    fill: colorScales.pink[9],
    stroke: colorScales.pink[8],
  },
  Failed: {
    fill: colorScales.red[9],
    stroke: colorScales.red[11],
  },
  Terminated: {
    fill: colorScales.red[9],
    stroke: colorScales.red[11],
  },
  TimedOut: {
    fill: colorScales.persimmon[11],
    stroke: colorScales.persimmon[9],
  },
  Canceled: {
    fill: colorScales.amber[9],
    stroke: colorScales.amber[3],
  },
};

const CATEGORY_DOT_COLORS: Record<string, DotColors> = {
  marker: { fill: colorScales.neutral[1], stroke: DEFAULT_DOT_STROKE },
  command: { fill: colorScales.neutral[1], stroke: DEFAULT_DOT_STROKE },
  timer: {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.timer,
    stroke: DEFAULT_DOT_STROKE,
  },
  signal: {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.signal,
    stroke: DEFAULT_DOT_STROKE,
  },
  activity: {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.activity,
    stroke: DEFAULT_DOT_STROKE,
  },
  pending: {
    fill: DEFAULT_DOT_STROKE,
    stroke: colorScales['slate-blue'][8],
  },
  'child-workflow': {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.workflow,
    stroke: DEFAULT_DOT_STROKE,
  },
  update: { fill: colorScales.blue[9], stroke: DEFAULT_DOT_STROKE },
  workflow: {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.workflow,
    stroke: DEFAULT_DOT_STROKE,
  },
  'local-activity': {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.activity,
    stroke: DEFAULT_DOT_STROKE,
  },
  nexus: {
    fill: WORKFLOW_ACTION_COLOR_VARIABLES.nexus,
    stroke: DEFAULT_DOT_STROKE,
  },
};

export function dotColors(
  classification?: string | null,
  category?: string,
): DotColors {
  return (
    (classification && CLASSIFICATION_DOT_COLORS[classification]) ||
    (category && CATEGORY_DOT_COLORS[category]) ||
    DOT_DEFAULT
  );
}

export function strokeColor({
  status,
  category,
  classification,
  delayed = false,
}: {
  status?: WorkflowStatus | 'none';
  category?: EventTypeCategory | 'pending' | 'retry';
  classification?: EventClassification;
  delayed?: boolean;
}): string {
  let color = DEFAULT_STROKE_COLOR;
  if (status) {
    color =
      status === 'none' ? DEFAULT_DOT_STROKE : getStatusStrokeColor(status);
  }
  if (category) {
    const categoryColor = getCategoryStrokeColor(category);
    if (categoryColor !== DEFAULT_STROKE_COLOR) color = categoryColor;
  }
  if (classification) {
    const statusColor = getStatusStrokeColor(classification);
    if (statusColor !== DEFAULT_STROKE_COLOR) color = statusColor;
  }
  if (delayed && (classification === 'Running' || status === 'Running')) {
    color = getStatusStrokeColor('Delayed');
  }
  if (category === 'pending' || category === 'retry') {
    color = getCategoryStrokeColor(category);
  }
  return color;
}
