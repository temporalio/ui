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
          encoding: 'anNvbi9wbGFpbg==',
        },
        data: 'InRlc3RAdGVzdC5jb20i',
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
      encryption: null,
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
  input: { payloads: ['test@test.com'] },
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
      encryption: null,
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
          encoding: 'anNvbi9wbGFpbg==',
        },
        data: 'InRlc3RAdGVzdC5jb20i',
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
      encryption: null,
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
  input: { payloads: ['test@test.com'] },
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
      encryption: null,
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
            encoding: 'anNvbi9wbGFpbg==',
            'encryption-key-id': '',
          },
          data: 'InRlc3RAdGVzdC5jb20i',
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
        encryption: null,
      },
    },
  },
};

export const getTestPayloadEvent = () => ({
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
          encoding: 'anNvbi9wbGFpbg==',
        },
        data: 'InRlc3RAdGVzdC5jb20i',
      },
    ],
  },
  details: {
    detail1: {
      payloads: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
          },
          data: 'eyAidGVzdCI6ICJkZXRhaWwiIH0=',
        },
      ],
    },
  },
  encodedAttributes: {
    metadata: {
      encoding: 'anNvbi9wbGFpbg==',
    },
    data: 'ImEgdGVzdCBhdHRyaWJ1dGUi',
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
  prevAutoResetPoints: null,
});

export const getTestPayloadEventWithNullEncodedAttributes = () => ({
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
          encoding: 'anNvbi9wbGFpbg==',
        },
        data: 'InRlc3RAdGVzdC5jb20i',
      },
    ],
  },
  details: {
    detail1: {
      payloads: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
          },
          data: 'eyAidGVzdCI6ICJkZXRhaWwiIH0=',
        },
      ],
    },
  },
  encodedAttributes: null,
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
  prevAutoResetPoints: null,
});
