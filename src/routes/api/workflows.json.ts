const apiHost = process.env.TEMPORAL_API_HOST || 'http://localhost:8088';

/*
 * TODO: Add better error handling.
 * - If one request has a 400- 500-level error, they both should.
 * - The current implementation is naive. It only deals with
 *   an error state if the promises outright reject, which will
 *   only happen in the event that there is no error handling.
 */

const fetchWorkflows: (
  type: string,
  query: URLSearchParams,
) => Promise<WorkflowsAPIResponse> = async (type, query) => {
  const response = await fetch(
    `${apiHost}/api/namespaces/default/workflows/${type}?${query.toString()}`,
  );
  return await response.json();
};

export async function get({ query }: { query: URLSearchParams }) {
  const openWorkflows = fetchWorkflows('open', query);
  const closedWorkflows = fetchWorkflows('closed', query);

  const workflows = await Promise.all([openWorkflows, closedWorkflows]).then(
    ([open, closed]) => {
      return {
        executions: [...open.executions, ...closed.executions],
        nextPageTokens: {
          open: open.nextPageToken,
          closed: closed.nextPageToken,
        },
      };
    },
  );

  if (workflows) {
    return {
      body: {
        workflows,
      },
    };
  }
}
