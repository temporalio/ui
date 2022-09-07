export declare const workflowStartedEvent: {
    type: string;
    workflowType: {
        name: string;
    };
    parentWorkflowNamespace: string;
    parentWorkflowExecution: any;
    parentInitiatedEventId: string;
    taskQueue: {
        name: string;
        kind: string;
    };
    input: {
        payloads: {
            metadata: {
                encoding: string;
                'encryption-key-id': string;
            };
            data: string;
        }[];
    };
    workflowExecutionTimeout: string;
    workflowRunTimeout: string;
    workflowTaskTimeout: string;
    continuedExecutionRunId: string;
    initiator: string;
    continuedFailure: any;
    lastCompletionResult: any;
    originalExecutionRunId: string;
    identity: string;
    firstExecutionRunId: string;
    retryPolicy: any;
    attempt: number;
    workflowExecutionExpirationTime: any;
    cronSchedule: string;
    firstWorkflowTaskBackoff: string;
    memo: any;
    searchAttributes: {
        indexedFields: {
            CandidateEmail: {
                metadata: {
                    encoding: string;
                    type: string;
                };
                data: string;
            };
        };
    };
    prevAutoResetPoints: any;
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: string;
                };
                data: any;
            };
        };
    };
};
export declare const dataConvertedWorkflowStartedEvent: {
    type: string;
    workflowType: {
        name: string;
    };
    parentWorkflowNamespace: string;
    parentWorkflowExecution: any;
    parentInitiatedEventId: string;
    taskQueue: {
        name: string;
        kind: string;
    };
    input: {
        payloads: {
            Transformer: string;
        }[];
    };
    workflowExecutionTimeout: string;
    workflowRunTimeout: string;
    workflowTaskTimeout: string;
    continuedExecutionRunId: string;
    initiator: string;
    continuedFailure: any;
    lastCompletionResult: any;
    originalExecutionRunId: string;
    identity: string;
    firstExecutionRunId: string;
    retryPolicy: any;
    attempt: number;
    workflowExecutionExpirationTime: any;
    cronSchedule: string;
    firstWorkflowTaskBackoff: string;
    memo: any;
    searchAttributes: {
        indexedFields: {
            CandidateEmail: string;
        };
    };
    prevAutoResetPoints: any;
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: string;
                    encodingDecoded: string;
                };
                data: any;
            };
        };
    };
};
export declare const dataConvertedFailureWorkflowStartedEvent: {
    type: string;
    workflowType: {
        name: string;
    };
    parentWorkflowNamespace: string;
    parentWorkflowExecution: any;
    parentInitiatedEventId: string;
    taskQueue: {
        name: string;
        kind: string;
    };
    input: {
        payloads: {
            metadata: {
                encoding: string;
                'encryption-key-id': string;
            };
            data: string;
        }[];
    };
    workflowExecutionTimeout: string;
    workflowRunTimeout: string;
    workflowTaskTimeout: string;
    continuedExecutionRunId: string;
    initiator: string;
    continuedFailure: any;
    lastCompletionResult: any;
    originalExecutionRunId: string;
    identity: string;
    firstExecutionRunId: string;
    retryPolicy: any;
    attempt: number;
    workflowExecutionExpirationTime: any;
    cronSchedule: string;
    firstWorkflowTaskBackoff: string;
    memo: any;
    searchAttributes: {
        indexedFields: {
            CandidateEmail: string;
        };
    };
    prevAutoResetPoints: any;
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: string;
                    encodingDecoded: string;
                };
                data: any;
            };
        };
    };
};
export declare const noRemoteDataConverterWorkflowStartedEvent: {
    type: string;
    workflowType: {
        name: string;
    };
    parentWorkflowNamespace: string;
    parentWorkflowExecution: any;
    parentInitiatedEventId: string;
    taskQueue: {
        name: string;
        kind: string;
    };
    input: {
        payloads: {
            metadata: {
                encoding: string;
                'encryption-key-id': string;
                encodingDecoded: string;
            };
            data: string;
        }[];
    };
    workflowExecutionTimeout: string;
    workflowRunTimeout: string;
    workflowTaskTimeout: string;
    continuedExecutionRunId: string;
    initiator: string;
    continuedFailure: any;
    lastCompletionResult: any;
    originalExecutionRunId: string;
    identity: string;
    firstExecutionRunId: string;
    retryPolicy: any;
    attempt: number;
    workflowExecutionExpirationTime: any;
    cronSchedule: string;
    firstWorkflowTaskBackoff: string;
    memo: any;
    searchAttributes: {
        indexedFields: {
            CandidateEmail: string;
        };
    };
    prevAutoResetPoints: any;
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: string;
                    encodingDecoded: string;
                };
                data: any;
            };
        };
    };
};
export declare const workflowStartedHistoryEvent: {
    workflowExecutionStartedEventAttributes: {
        workflowType: {
            name: string;
        };
        parentWorkflowNamespace: string;
        parentWorkflowExecution: any;
        parentInitiatedEventId: string;
        taskQueue: {
            name: string;
            kind: string;
        };
        input: {
            payloads: {
                metadata: {
                    encoding: string;
                    'encryption-key-id': string;
                };
                data: string;
            }[];
        };
        workflowExecutionTimeout: string;
        workflowRunTimeout: string;
        workflowTaskTimeout: string;
        continuedExecutionRunId: string;
        initiator: string;
        continuedFailure: any;
        lastCompletionResult: any;
        originalExecutionRunId: string;
        identity: string;
        firstExecutionRunId: string;
        retryPolicy: any;
        attempt: number;
        workflowExecutionExpirationTime: any;
        cronSchedule: string;
        firstWorkflowTaskBackoff: string;
        memo: any;
        searchAttributes: {
            indexedFields: {
                CandidateEmail: {
                    metadata: {
                        encoding: string;
                        type: string;
                    };
                    data: string;
                };
            };
        };
        prevAutoResetPoints: any;
        header: {
            fields: {
                encryption: {
                    metadata: {
                        encoding: string;
                    };
                    data: any;
                };
            };
        };
    };
};
