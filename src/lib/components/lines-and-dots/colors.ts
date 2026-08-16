import type { EventClassification, EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

const DEFAULT_STROKE_COLOR = 'currentColor';

const semanticColor = (token: string): string => `rgb(var(${token}))`;

const INFORMATION = semanticColor('--color-border-information');
const SUCCESS = semanticColor('--color-border-success');
const WARNING = semanticColor('--color-border-warning');
const DANGER = semanticColor('--color-border-danger');
const BRAND = semanticColor('--color-surface-brand');
const SECONDARY = semanticColor('--color-text-secondary');
const PRIMARY = semanticColor('--color-text-primary');

const STATUS_STROKE_COLORS: Record<
  NonNullable<WorkflowStatus> | EventClassification | 'Delayed',
  string
> = {
  Completed: SUCCESS,
  Failed: DANGER,
  Terminated: DANGER,
  Signaled: BRAND,
  Fired: WARNING,
  TimedOut: WARNING,
  Canceled: SECONDARY,
  Running: INFORMATION,
  Delayed: WARNING,
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
  timer: WARNING,
  signal: BRAND,
  activity: SECONDARY,
  workflow: INFORMATION,
  marker: SECONDARY,
  command: SECONDARY,
  'child-workflow': SUCCESS,
  update: INFORMATION,
  pending: INFORMATION,
  retry: DANGER,
  'local-activity': DEFAULT_STROKE_COLOR,
  nexus: DEFAULT_STROKE_COLOR,
  other: DEFAULT_STROKE_COLOR,
};

export const getCategoryStrokeColor = (
  category: EventTypeCategory | 'pending' | 'retry' | 'marker' | 'command',
): string => CATEGORY_STROKE_COLORS[category] ?? DEFAULT_STROKE_COLOR;

export type DotColors = { readonly fill: string; readonly stroke: string };

const DOT_DEFAULT: DotColors = {
  fill: semanticColor('--color-surface-subtle'),
  stroke: SECONDARY,
};

const CLASSIFICATION_DOT_COLORS: Record<string, DotColors> = {
  Started: {
    fill: semanticColor('--color-surface-information'),
    stroke: INFORMATION,
  },
  Running: {
    fill: semanticColor('--color-surface-information'),
    stroke: INFORMATION,
  },
  Completed: {
    fill: semanticColor('--color-surface-success'),
    stroke: SUCCESS,
  },
  Fired: {
    fill: semanticColor('--color-surface-warning'),
    stroke: WARNING,
  },
  Signaled: {
    fill: semanticColor('--color-surface-information'),
    stroke: BRAND,
  },
  Failed: {
    fill: semanticColor('--color-surface-danger'),
    stroke: DANGER,
  },
  Terminated: {
    fill: semanticColor('--color-surface-danger'),
    stroke: DANGER,
  },
  TimedOut: {
    fill: semanticColor('--color-surface-warning'),
    stroke: WARNING,
  },
  Canceled: {
    fill: semanticColor('--color-surface-subtle'),
    stroke: SECONDARY,
  },
};

const CATEGORY_DOT_COLORS: Record<string, DotColors> = {
  marker: DOT_DEFAULT,
  command: DOT_DEFAULT,
  timer: {
    fill: semanticColor('--color-surface-warning'),
    stroke: WARNING,
  },
  signal: {
    fill: semanticColor('--color-surface-information'),
    stroke: BRAND,
  },
  activity: {
    fill: semanticColor('--color-surface-secondary'),
    stroke: SECONDARY,
  },
  pending: {
    fill: semanticColor('--color-surface-information'),
    stroke: INFORMATION,
  },
  'child-workflow': {
    fill: semanticColor('--color-surface-success'),
    stroke: SUCCESS,
  },
  update: {
    fill: semanticColor('--color-surface-information'),
    stroke: INFORMATION,
  },
  workflow: {
    fill: semanticColor('--color-surface-information'),
    stroke: INFORMATION,
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
    color = status === 'none' ? PRIMARY : getStatusStrokeColor(status);
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
