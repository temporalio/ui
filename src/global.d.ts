/// <reference types="@sveltejs/kit" />

type WorkflowsAPIResponse = {
  executions: WorkflowExecutionAPIReponse[];
  nextPageToken: string;
};

type WorkflowExecutionAPIReponse = {
  execution: {
    workflowId: string;
    runId: string;
  };
  type: { name: string };
  startTime: string;
  closeTime: string;
  status: string;
  historyLength: string;
  parentNamespaceId: string;
  parentExecution: any; // TODO: Refine this with a more percise type.
  executionTime: string;
  memo: any[]; // TODO: Refine this with a more percise type.
  searchAttributes: string; // TODO: Refine this with a more percise type.
  autoResetPoints: string; // TODO: Refine this with a more percise type.
  taskQueue: string;
  stateTransitionCount: string;
};
