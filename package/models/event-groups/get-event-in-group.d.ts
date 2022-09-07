export declare const eventIsFailureOrTimedOut: (event: WorkflowEvent) => boolean;
export declare const eventOrGroupIsFailureOrTimedOut: (event: IterableEvent) => boolean;
export declare const eventIsCanceled: (event: WorkflowEvent) => boolean;
export declare const eventOrGroupIsCanceled: (event: IterableEvent) => boolean;
export declare const eventIsTerminated: (event: WorkflowEvent) => boolean;
export declare const eventOrGroupIsTerminated: (event: IterableEvent) => boolean;
