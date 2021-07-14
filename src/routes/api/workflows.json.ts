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

  // const workflows = await Promise.all([openWorkflows, closedWorkflows]).then(
  //   ([open, closed]) => {
  //     return {
  //       executions: [...open.executions, ...closed.executions],
  //       nextPageTokens: {
  //         open: open.nextPageToken,
  //         closed: closed.nextPageToken,
  //       },
  //     };
  //   },
  // );

  // DELETE ME
  const workflows = {
    executions: [
      {
        execution: {
          workflowId: 'expense_1ff36d8c-a592-4413-8c3e-60f2b2987218',
          runId: 'a81f12a5-58f7-4e07-a0b0-e303d9fa4cff',
        },
        type: { name: 'SampleExpenseWorkflow' },
        startTime: '2021-07-09T17:24:21.000Z',
        closeTime: null,
        status: 'Running',
        historyLength: '0',
        parentNamespaceId: '',
        parentExecution: null,
        executionTime: '2021-07-09T17:24:21.000Z',
        memo: [],
        searchAttributes: null,
        autoResetPoints: null,
        taskQueue: 'expense',
        stateTransitionCount: '0',
      },
      {
        execution: {
          workflowId: 'greetings_31ea8053-a90e-40ae-bd3b-669df4e8b984',
          runId: '19e777fa-1c76-47af-8d9b-f8a042f62e18',
        },
        type: { name: 'GreetingSample' },
        startTime: '2021-07-13T16:32:24.000Z',
        closeTime: '2021-07-13T16:32:24.000Z',
        status: 'Completed',
        historyLength: '23',
        parentNamespaceId: '',
        parentExecution: null,
        executionTime: '2021-07-13T16:32:24.000Z',
        memo: [],
        searchAttributes: null,
        autoResetPoints: null,
        taskQueue: 'greetings',
        stateTransitionCount: '0',
      },
      {
        execution: {
          workflowId: 'pick-first_156a0e9a-de9c-4c99-9409-511c2f99ae90',
          runId: 'e6a1d020-39b8-4217-bcaa-95cff29ab49a',
        },
        type: { name: 'SamplePickFirstWorkflow' },
        startTime: '2021-07-13T16:31:21.000Z',
        closeTime: '2021-07-13T16:31:23.000Z',
        status: 'Completed',
        historyLength: '18',
        parentNamespaceId: '',
        parentExecution: null,
        executionTime: '2021-07-13T16:31:21.000Z',
        memo: [],
        searchAttributes: null,
        autoResetPoints: null,
        taskQueue: 'pick-first',
        stateTransitionCount: '0',
      },
    ],
    nextPageTokens: { open: '', closed: '' },
  };

  // END DELETE

  if (workflows) {
    return {
      body: {
        workflows,
      },
    };
  }
}
