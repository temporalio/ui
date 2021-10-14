export const getActivityUrl =
  (namespace: string, executionId: string, runId: string) =>
  (activityId = ''): string => {
    return `/namespaces/${namespace}/workflows/${executionId}/${runId}/activities/${activityId}`;
  };
