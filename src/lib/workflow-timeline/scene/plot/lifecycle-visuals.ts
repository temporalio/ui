import type { LifecycleKind } from '../../data/lifecycle-groups/types';

/** Category-only icons and colors for plotted lifecycle rows. */
export const lifecycleVisuals: Record<
  LifecycleKind,
  Readonly<{ icon: string; color: string }>
> = {
  activity: {
    icon: 'activity',
    color: 'var(--color-action-workflow-activity)',
  },
  'child-workflow': {
    icon: 'relationship',
    color: 'var(--color-action-workflow-workflow)',
  },
  'external-signal': {
    icon: 'signal',
    color: 'var(--color-action-workflow-signal)',
  },
  'nexus-operation': {
    icon: 'nexus',
    color: 'var(--color-action-workflow-nexus)',
  },
  timer: {
    icon: 'timer',
    color: 'var(--color-action-workflow-timer)',
  },
  update: {
    icon: 'update',
    color: 'var(--color-action-workflow-signal)',
  },
  'workflow-task': {
    icon: 'workflow',
    color: 'var(--color-action-workflow-workflow)',
  },
  event: {
    icon: 'terminal',
    color: 'currentColor',
  },
};
