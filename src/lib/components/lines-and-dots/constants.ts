import {
  type IconComponent,
  IconFeather,
  IconRelationship,
  IconStopwatch,
  IconTemporalActivity,
  IconTemporalNexus,
  IconTemporalSignal,
  IconTemporalUpdate,
  IconTemporalWorkflow,
  IconTerminal,
} from '$lib/io/icon';
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
  { name: TimelineIconName; Icon: IconComponent; title: string }
> = {
  workflow: { name: 'workflow', Icon: IconTemporalWorkflow, title: 'Workflow' },
  signal: { name: 'signal', Icon: IconTemporalSignal, title: 'Signal' },
  activity: { name: 'activity', Icon: IconTemporalActivity, title: 'Activity' },
  nexus: { name: 'nexus', Icon: IconTemporalNexus, title: 'Nexus' },
  timer: { name: 'retention', Icon: IconStopwatch, title: 'Timer' },
  'local-activity': {
    name: 'feather',
    Icon: IconFeather,
    title: 'Local Activity',
  },
  'child-workflow': {
    name: 'relationship',
    Icon: IconRelationship,
    title: 'Child Workflow',
  },
  update: { name: 'update', Icon: IconTemporalUpdate, title: 'Update' },
  other: { name: 'terminal', Icon: IconTerminal, title: 'Other' },
};
