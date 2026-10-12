import type { RefreshAction } from '$lib/stores/workflow-run';

type ShouldRefetchOptions = {
  refresh: RefreshAction;
  pauseLiveUpdates: boolean;
  isRunning: boolean | undefined;
};

/**
 * Whether a `$refresh` write should refetch the workflow describe.
 *
 * A refresh carrying an action was requested by a user action (pause, update,
 * cancel...) and must always land. Compare against null rather than testing
 * truthiness: the action enums start at 0, so `Action.Pause` and
 * `WorkflowAction.Cancel` are falsy while still being real actions.
 *
 * An actionless refresh is the ambient 10s poll, which only runs while the
 * workflow is live and the user has not paused live updates.
 */
export const shouldRefetchWorkflowRun = ({
  refresh,
  pauseLiveUpdates,
  isRunning,
}: ShouldRefetchOptions): boolean => {
  if (!refresh.timestamp) return false;
  if (refresh.action !== null && refresh.action !== undefined) return true;
  return !pauseLiveUpdates && Boolean(isRunning);
};
