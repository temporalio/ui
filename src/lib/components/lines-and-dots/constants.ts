import type { EventTypeCategory } from '$lib/types/events';

// Icon names backed by the <symbol> defs in TimelineIconDefs; rendered as
// <use href="#ti-{name}"> in the timeline rows.
export type TimelineIconName =
  | 'workflow'
  | 'retry'
  | 'pause'
  | 'activity'
  | 'signal'
  | 'retention'
  | 'feather'
  | 'relationship'
  | 'update'
  | 'terminal'
  | 'nexus';

export const CategoryIcon: Record<
  EventTypeCategory,
  { name: TimelineIconName; title: string }
> = {
  workflow: { name: 'workflow', title: 'Workflow' },
  signal: { name: 'signal', title: 'Signal' },
  activity: { name: 'activity', title: 'Activity' },
  nexus: { name: 'nexus', title: 'Nexus' },
  timer: { name: 'retention', title: 'Timer' },
  'local-activity': { name: 'feather', title: 'Local Activity' },
  'child-workflow': { name: 'relationship', title: 'Child Workflow' },
  update: { name: 'update', title: 'Update' },
  other: { name: 'terminal', title: 'Other' },
};
