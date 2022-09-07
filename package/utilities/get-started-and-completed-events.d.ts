declare type WorkflowInputAndResults = {
    input: string;
    results: string;
};
export declare const getWorkflowStartedAndCompletedEvents: (events: WorkflowEvents) => WorkflowInputAndResults;
export {};
