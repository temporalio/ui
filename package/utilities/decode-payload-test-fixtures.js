export const workflowStartedEvent = {
    type: 'workflowExecutionStartedEventAttributes',
    workflowType: {
        name: 'BackgroundCheck',
    },
    parentWorkflowNamespace: '',
    parentWorkflowExecution: null,
    parentInitiatedEventId: '0',
    taskQueue: {
        name: 'background-checks-main',
        kind: 'Normal',
    },
    input: {
        payloads: [
            {
                metadata: {
                    encoding: 'YmluYXJ5L2VuY3J5cHRlZA==',
                    'encryption-key-id': '',
                },
                data: 'jfgr8zMj+jHMPeSgxnMnUw//hBOox6L38f52OX/ftDAoJkUi/zdtl7950O6wJG68GdX0WtwmV48GaGkC04pYyCjr5E2MSi/pG/SZbIRHoqs3GmWdvcBjQIAzTElk8aqP3r0ttRynyyLe',
            },
        ],
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    workflowTaskTimeout: '10s',
    continuedExecutionRunId: '',
    initiator: 'Unspecified',
    continuedFailure: null,
    lastCompletionResult: null,
    originalExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    identity: '1@ac0cd56257aa@',
    firstExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    retryPolicy: null,
    attempt: 1,
    workflowExecutionExpirationTime: null,
    cronSchedule: '',
    firstWorkflowTaskBackoff: '0s',
    memo: null,
    searchAttributes: {
        indexedFields: {
            CandidateEmail: {
                metadata: {
                    encoding: 'anNvbi9wbGFpbg==',
                    type: 'S2V5d29yZA==',
                },
                data: 'IndoYWR1cEBsb2xjYXRzLmNvbSI=',
            },
        },
    },
    prevAutoResetPoints: null,
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: 'YmluYXJ5L251bGw=',
                },
                data: null,
            },
        },
    },
};
export const dataConvertedWorkflowStartedEvent = {
    type: 'workflowExecutionStartedEventAttributes',
    workflowType: { name: 'BackgroundCheck' },
    parentWorkflowNamespace: '',
    parentWorkflowExecution: null,
    parentInitiatedEventId: '0',
    taskQueue: { name: 'background-checks-main', kind: 'Normal' },
    input: { payloads: [{ Transformer: 'OptimusPrime' }] },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    workflowTaskTimeout: '10s',
    continuedExecutionRunId: '',
    initiator: 'Unspecified',
    continuedFailure: null,
    lastCompletionResult: null,
    originalExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    identity: '1@ac0cd56257aa@',
    firstExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    retryPolicy: null,
    attempt: 1,
    workflowExecutionExpirationTime: null,
    cronSchedule: '',
    firstWorkflowTaskBackoff: '0s',
    memo: null,
    searchAttributes: { indexedFields: { CandidateEmail: 'whadup@lolcats.com' } },
    prevAutoResetPoints: null,
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: 'YmluYXJ5L251bGw=',
                    encodingDecoded: 'binary/null',
                },
                data: null,
            },
        },
    },
};
export const dataConvertedFailureWorkflowStartedEvent = {
    type: 'workflowExecutionStartedEventAttributes',
    workflowType: { name: 'BackgroundCheck' },
    parentWorkflowNamespace: '',
    parentWorkflowExecution: null,
    parentInitiatedEventId: '0',
    taskQueue: { name: 'background-checks-main', kind: 'Normal' },
    input: {
        payloads: [
            {
                metadata: {
                    encoding: 'YmluYXJ5L2VuY3J5cHRlZA==',
                    'encryption-key-id': '',
                },
                data: 'jfgr8zMj+jHMPeSgxnMnUw//hBOox6L38f52OX/ftDAoJkUi/zdtl7950O6wJG68GdX0WtwmV48GaGkC04pYyCjr5E2MSi/pG/SZbIRHoqs3GmWdvcBjQIAzTElk8aqP3r0ttRynyyLe',
            },
        ],
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    workflowTaskTimeout: '10s',
    continuedExecutionRunId: '',
    initiator: 'Unspecified',
    continuedFailure: null,
    lastCompletionResult: null,
    originalExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    identity: '1@ac0cd56257aa@',
    firstExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    retryPolicy: null,
    attempt: 1,
    workflowExecutionExpirationTime: null,
    cronSchedule: '',
    firstWorkflowTaskBackoff: '0s',
    memo: null,
    searchAttributes: { indexedFields: { CandidateEmail: 'whadup@lolcats.com' } },
    prevAutoResetPoints: null,
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: 'YmluYXJ5L251bGw=',
                    encodingDecoded: 'binary/null',
                },
                data: null,
            },
        },
    },
};
export const noRemoteDataConverterWorkflowStartedEvent = {
    type: 'workflowExecutionStartedEventAttributes',
    workflowType: { name: 'BackgroundCheck' },
    parentWorkflowNamespace: '',
    parentWorkflowExecution: null,
    parentInitiatedEventId: '0',
    taskQueue: { name: 'background-checks-main', kind: 'Normal' },
    input: {
        payloads: [
            {
                metadata: {
                    encoding: 'YmluYXJ5L2VuY3J5cHRlZA==',
                    'encryption-key-id': '',
                    encodingDecoded: 'binary/encrypted',
                },
                data: 'jfgr8zMj+jHMPeSgxnMnUw//hBOox6L38f52OX/ftDAoJkUi/zdtl7950O6wJG68GdX0WtwmV48GaGkC04pYyCjr5E2MSi/pG/SZbIRHoqs3GmWdvcBjQIAzTElk8aqP3r0ttRynyyLe',
            },
        ],
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    workflowTaskTimeout: '10s',
    continuedExecutionRunId: '',
    initiator: 'Unspecified',
    continuedFailure: null,
    lastCompletionResult: null,
    originalExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    identity: '1@ac0cd56257aa@',
    firstExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
    retryPolicy: null,
    attempt: 1,
    workflowExecutionExpirationTime: null,
    cronSchedule: '',
    firstWorkflowTaskBackoff: '0s',
    memo: null,
    searchAttributes: { indexedFields: { CandidateEmail: 'whadup@lolcats.com' } },
    prevAutoResetPoints: null,
    header: {
        fields: {
            encryption: {
                metadata: {
                    encoding: 'YmluYXJ5L251bGw=',
                    encodingDecoded: 'binary/null',
                },
                data: null,
            },
        },
    },
};
export const workflowStartedHistoryEvent = {
    workflowExecutionStartedEventAttributes: {
        workflowType: {
            name: 'BackgroundCheck',
        },
        parentWorkflowNamespace: '',
        parentWorkflowExecution: null,
        parentInitiatedEventId: '0',
        taskQueue: {
            name: 'background-checks-main',
            kind: 'Normal',
        },
        input: {
            payloads: [
                {
                    metadata: {
                        encoding: 'YmluYXJ5L2VuY3J5cHRlZA==',
                        'encryption-key-id': '',
                    },
                    data: 'jfgr8zMj+jHMPeSgxnMnUw//hBOox6L38f52OX/ftDAoJkUi/zdtl7950O6wJG68GdX0WtwmV48GaGkC04pYyCjr5E2MSi/pG/SZbIRHoqs3GmWdvcBjQIAzTElk8aqP3r0ttRynyyLe',
                },
            ],
        },
        workflowExecutionTimeout: '0s',
        workflowRunTimeout: '0s',
        workflowTaskTimeout: '10s',
        continuedExecutionRunId: '',
        initiator: 'Unspecified',
        continuedFailure: null,
        lastCompletionResult: null,
        originalExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
        identity: '1@ac0cd56257aa@',
        firstExecutionRunId: 'b4351cb3-f54f-4ed4-be5a-b13ef429b861',
        retryPolicy: null,
        attempt: 1,
        workflowExecutionExpirationTime: null,
        cronSchedule: '',
        firstWorkflowTaskBackoff: '0s',
        memo: null,
        searchAttributes: {
            indexedFields: {
                CandidateEmail: {
                    metadata: {
                        encoding: 'anNvbi9wbGFpbg==',
                        type: 'S2V5d29yZA==',
                    },
                    data: 'IndoYWR1cEBsb2xjYXRzLmNvbSI=',
                },
            },
        },
        prevAutoResetPoints: null,
        header: {
            fields: {
                encryption: {
                    metadata: {
                        encoding: 'YmluYXJ5L251bGw=',
                    },
                    data: null,
                },
            },
        },
    },
};
