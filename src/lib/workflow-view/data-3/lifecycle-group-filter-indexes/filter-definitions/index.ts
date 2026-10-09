import type { LifecycleGroupFilterDefinition } from '../types';
import { isActivityCategory } from './is-activity-category';
import { isChildWorkflowCategory } from './is-child-workflow-category';
import { isLocalActivityCategory } from './is-local-activity-category';
import { isNexusCategory } from './is-nexus-category';
import { isOtherCategory } from './is-other-category';
import { isSignalCategory } from './is-signal-category';
import { isTimerCategory } from './is-timer-category';
import { isUpdateCategory } from './is-update-category';
import { isWorkflowCategory } from './is-workflow-category';

export const allLifecycleGroupFilterDefinitions: readonly LifecycleGroupFilterDefinition[] =
  [
    isActivityCategory,
    isChildWorkflowCategory,
    isLocalActivityCategory,
    isSignalCategory,
    isTimerCategory,
    isUpdateCategory,
    isNexusCategory,
    isWorkflowCategory,
    isOtherCategory,
  ];
