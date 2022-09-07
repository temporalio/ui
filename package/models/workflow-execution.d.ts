export declare const toWorkflowExecution: (response?: WorkflowExecutionAPIResponse) => WorkflowExecution;
export declare const toWorkflowExecutions: (response: Pick<ListWorkflowExecutionsResponse, 'executions'>) => WorkflowExecution[];
