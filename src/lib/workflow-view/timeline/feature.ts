export const NEW_WORKFLOW_TIMELINE_QUERY_PARAMETER = 'new_timeline';

export function isNewWorkflowTimelineEnabled(url: URL): boolean {
  return url.searchParams.get(NEW_WORKFLOW_TIMELINE_QUERY_PARAMETER) === 'true';
}

export function shouldUseNewWorkflowTimeline(
  url: URL,
  routeId: string | null,
): boolean {
  return (
    routeId?.endsWith('/timeline') === true && isNewWorkflowTimelineEnabled(url)
  );
}
