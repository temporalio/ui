import type { LifecycleKind } from '../../data/lifecycle-groups/types';

/** Category-only icons and colors for plotted lifecycle rows. */
export const lifecycleVisuals: Record<
  LifecycleKind,
  Readonly<{ icon: string; bgColor: string }>
> = {
  workflow: {
    icon: 'workflow',
    bgColor: 'var(--color-action-workflow-workflow)',
  },
  activity: {
    icon: 'activity',
    bgColor: 'var(--color-action-workflow-activity)',
  },
  'child-workflow': {
    icon: 'relationship',
    bgColor: 'var(--color-action-workflow-workflow)',
  },
  'external-signal': {
    icon: 'signal',
    bgColor: 'var(--color-action-workflow-signal)',
  },
  'nexus-operation': {
    icon: 'nexus',
    bgColor: 'var(--color-action-workflow-nexus)',
  },
  timer: {
    icon: 'timer',
    bgColor: 'var(--color-action-workflow-timer)',
  },
  update: {
    icon: 'update',
    bgColor: 'var(--color-action-workflow-signal)',
  },
  event: {
    icon: 'terminal',
    bgColor: 'currentColor',
  },
};
