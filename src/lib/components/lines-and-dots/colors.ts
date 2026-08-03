import type { EventClassification, EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

const DEFAULT_STROKE_COLOR = 'currentColor';

const STATUS_STROKE_COLORS: Record<
  NonNullable<WorkflowStatus> | EventClassification | 'Delayed',
  string
> = {
  Completed: '#1ff1a5',
  Failed: '#c71607',
  Terminated: '#c71607',
  Signaled: '#d300d8',
  Fired: '#f8a208',
  TimedOut: '#f97316',
  Canceled: '#fed64b',
  Running: '#3b82f6',
  Delayed: '#fbbf24',
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
  timer: '#fbbf24',
  signal: '#d300d8',
  activity: '#a78bfa',
  workflow: '#ebebeb',
  marker: '#ebebeb',
  command: '#ebebeb',
  'child-workflow': '#0899B2',
  update: '#FF9B70',
  pending: '#a78bfa',
  retry: '#FF9B70',
  'local-activity': DEFAULT_STROKE_COLOR,
  nexus: DEFAULT_STROKE_COLOR,
  other: DEFAULT_STROKE_COLOR,
};

export const getCategoryStrokeColor = (
  category: EventTypeCategory | 'pending' | 'retry' | 'marker' | 'command',
): string => CATEGORY_STROKE_COLORS[category] ?? DEFAULT_STROKE_COLOR;

export type DotColors = { readonly fill: string; readonly stroke: string };

const DOT_DEFAULT: DotColors = { fill: '#e8efff', stroke: '#141414' };

const CLASSIFICATION_DOT_COLORS: Record<string, DotColors> = {
  Started: { fill: '#92a4c3', stroke: '#141414' },
  Completed: { fill: '#1ff1a5', stroke: '#00964e' },
  Fired: { fill: '#f8a208', stroke: '#fed64b' },
  Signaled: { fill: '#d300d8', stroke: '#ff26ff' },
  Failed: { fill: '#f55', stroke: '#c71607' },
  Terminated: { fill: '#f55', stroke: '#c71607' },
  TimedOut: { fill: '#c2570c', stroke: '#f97316' },
  Canceled: { fill: '#fed64b', stroke: '#fff4c6' },
};

const CATEGORY_DOT_COLORS: Record<string, DotColors> = {
  marker: { fill: '#ebebeb', stroke: '#141414' },
  command: { fill: '#ebebeb', stroke: '#141414' },
  timer: { fill: '#fbbf24', stroke: '#141414' },
  signal: { fill: '#d300d8', stroke: '#141414' },
  activity: { fill: '#a78bfa', stroke: '#141414' },
  pending: { fill: '#141414', stroke: '#a78bfa' },
  'child-workflow': { fill: '#b2f8d9', stroke: '#141414' },
  update: { fill: '#06b6d4', stroke: '#141414' },
  workflow: { fill: '#059669', stroke: '#141414' },
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
    color = status === 'none' ? '#141414' : getStatusStrokeColor(status);
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
