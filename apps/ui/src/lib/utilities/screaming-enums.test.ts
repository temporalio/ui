import { describe, expect, it } from 'vitest';

import { EventType } from './is-event-type';
import {
  fromScreamingEnum,
  toBatchOperationStateReadable,
  toBatchOperationTypeReadable,
  toEventNameReadable,
  toNamespaceArchivalStateReadable,
  toNamespaceStateReadable,
  toSearchAttributeTypeReadable,
  toWorkflowStatusReadable,
  toWorkflowTaskFailureReadable,
} from './screaming-enums';

fromScreamingEnum;
describe('fromScreamingEnum', () => {
  it('should return readable word from split with prefix', () => {
    expect(fromScreamingEnum('THIS_IS_PREFIX_CATS_MEOW', 'ThisIsPrefix')).toBe(
      'CatsMeow',
    );
  });
  it('should return original word from split with prefix if no underscore', () => {
    expect(fromScreamingEnum('THIS-IS-PREFIX-CATS-MEOW', 'ThisIsPrefix')).toBe(
      'THIS-IS-PREFIX-CATS-MEOW',
    );
  });
  it('should return empty string', () => {
    expect(fromScreamingEnum('', 'prefix')).toBe('');
  });
  it('should return empty string', () => {
    expect(fromScreamingEnum('', 'prefix')).toBe('');
  });
  it('should return undefined', () => {
    expect(fromScreamingEnum(undefined, 'prefix')).toBe(undefined);
  });
  it('should return original object value if not a string', () => {
    expect(fromScreamingEnum({ test: 'this' }, 'prefix')).toStrictEqual({
      test: 'this',
    });
  });
  it('should return original array value if not a string', () => {
    expect(fromScreamingEnum([], 'prefix')).toStrictEqual([]);
  });
});

describe('toSearchAttributeTypeReadable', () => {
  it('should return Keyword from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_KEYWORD')).toBe(
      'Keyword',
    );
  });
  it('should return Bool from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_BOOL')).toBe(
      'Bool',
    );
  });
  it('should return KeywordList from search attribute enum', () => {
    expect(
      toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_KEYWORD_LIST'),
    ).toBe('KeywordList');
  });
  it('should return Datetime from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_DATETIME')).toBe(
      'Datetime',
    );
  });
  it('should return Int from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_INT')).toBe('Int');
  });
  it('should return Double from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_DOUBLE')).toBe(
      'Double',
    );
  });
  it('should return Text from search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_TEXT')).toBe(
      'Text',
    );
  });
  it('should return readable from unknown search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('INDEXED_VALUE_TYPE_BIG_INT')).toBe(
      'BigInt',
    );
  });
  it('should return original enum from old search attribute enum', () => {
    expect(toSearchAttributeTypeReadable('KeywordList')).toBe('KeywordList');
  });
});

describe('toWorkflowStatusReadable', () => {
  it('should return Running from ExecutionStatus enum', () => {
    expect(toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_RUNNING')).toBe(
      'Running',
    );
  });
  it('should return Completed from ExecutionStatus enum', () => {
    expect(
      toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_COMPLETED'),
    ).toBe('Completed');
  });
  it('should return Failed from ExecutionStatus enum', () => {
    expect(toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_FAILED')).toBe(
      'Failed',
    );
  });
  it('should return Canceled from ExecutionStatus enum', () => {
    expect(toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_CANCELED')).toBe(
      'Canceled',
    );
  });
  it('should return Terminated from ExecutionStatus enum', () => {
    expect(
      toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_TERMINATED'),
    ).toBe('Terminated');
  });
  it('should return ContinuedAsNew from ExecutionStatus enum', () => {
    expect(
      toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW'),
    ).toBe('ContinuedAsNew');
  });
  it('should return TimedOut from ExecutionStatus enum', () => {
    expect(
      toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_TIMED_OUT'),
    ).toBe('TimedOut');
  });
  it('should return Unspecified from ExecutionStatus enum', () => {
    expect(
      toWorkflowStatusReadable('WORKFLOW_EXECUTION_STATUS_UNSPECIFIED'),
    ).toBe('Unspecified');
  });
  it('should return old Running enum from ExecutionStatus enum', () => {
    expect(toWorkflowStatusReadable('Running')).toBe('Running');
  });
});

describe('toNamespaceArchivalStateReadable', () => {
  it('should return Enabled from ArchivalState enum', () => {
    expect(toNamespaceArchivalStateReadable('ARCHIVAL_STATE_ENABLED')).toBe(
      'Enabled',
    );
  });
  it('should return Disabled from ArchivalState enum', () => {
    expect(toNamespaceArchivalStateReadable('ARCHIVAL_STATE_DISABLED')).toBe(
      'Disabled',
    );
  });
  it('should return Unspecified from ArchivalState enum', () => {
    expect(toNamespaceArchivalStateReadable('ARCHIVAL_STATE_UNSPECIFIED')).toBe(
      'Unspecified',
    );
  });
  it('should return Disabled from old ArchivalState enum', () => {
    expect(toNamespaceArchivalStateReadable('Disabled')).toBe('Disabled');
  });
});

describe('toNamespaceStateReadable', () => {
  it('should return Registered from NamespaceState enum', () => {
    expect(toNamespaceStateReadable('NAMESPACE_STATE_REGISTERED')).toBe(
      'Registered',
    );
  });
  it('should return Deprecated from NamespaceState enum', () => {
    expect(toNamespaceStateReadable('NAMESPACE_STATE_DEPRECATED')).toBe(
      'Deprecated',
    );
  });
  it('should return Deleted from NamespaceState enum', () => {
    expect(toNamespaceStateReadable('NAMESPACE_STATE_DELETED')).toBe('Deleted');
  });
  it('should return Unspecified from NamespaceState enum', () => {
    expect(toNamespaceStateReadable('NAMESPACE_STATE_UNSPECIFIED')).toBe(
      'Unspecified',
    );
  });
  it('should return Disabled from old NamespaceState enum', () => {
    expect(toNamespaceStateReadable('Registered')).toBe('Registered');
  });
});

describe('toBatchOperationStateReadable', () => {
  it('should return Running from BatchOperationState enum', () => {
    expect(toBatchOperationStateReadable('BATCH_OPERATION_STATE_RUNNING')).toBe(
      'Running',
    );
  });
  it('should return Completed from BatchOperationState enum', () => {
    expect(
      toBatchOperationStateReadable('BATCH_OPERATION_STATE_COMPLETED'),
    ).toBe('Completed');
  });
  it('should return Failed from BatchOperationState enum', () => {
    expect(toBatchOperationStateReadable('BATCH_OPERATION_STATE_FAILED')).toBe(
      'Failed',
    );
  });
  it('should return Unspecified from BatchOperationState enum', () => {
    expect(
      toBatchOperationStateReadable('BATCH_OPERATION_STATE_UNSPECIFIED'),
    ).toBe('Unspecified');
  });
  it('should return Completed from old BatchOperationState enum', () => {
    expect(toBatchOperationStateReadable('Completed')).toBe('Completed');
  });
});

describe('toBatchOperationTypeReadable', () => {
  it('should return Terminate from BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_TERMINATE')).toBe(
      'Terminate',
    );
  });
  it('should return Cancel from BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_CANCEL')).toBe(
      'Cancel',
    );
  });
  it('should return Signal from BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_SIGNAL')).toBe(
      'Signal',
    );
  });
  it('should return Delete from BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_DELETE')).toBe(
      'Delete',
    );
  });
  it('should return Reset from BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_RESET')).toBe(
      'Reset',
    );
  });
  it('should return Unspecified from BatchOperationType enum', () => {
    expect(
      toBatchOperationTypeReadable('BATCH_OPERATION_TYPE_UNSPECIFIED'),
    ).toBe('Unspecified');
  });
  it('should return Signal from old BatchOperationType enum', () => {
    expect(toBatchOperationTypeReadable('Signal')).toBe('Signal');
  });
});

describe('toEventNameReadable', () => {
  it('should return TimerStarted from EventType enum', () => {
    expect(toEventNameReadable('EVENT_TYPE_TIMER_STARTED' as EventType)).toBe(
      'TimerStarted',
    );
  });
  it('should return WorkflowExecutionFailed from EventType enum', () => {
    expect(
      toEventNameReadable('EVENT_TYPE_WORKFLOW_EXECUTION_FAILED' as EventType),
    ).toBe('WorkflowExecutionFailed');
  });
  it('should return WorkflowExecutionUpdateRequested from EventType enum', () => {
    expect(
      toEventNameReadable(
        'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REQUESTED' as EventType,
      ),
    ).toBe('WorkflowExecutionUpdateRequested');
  });
  it('should return old TimerStarted enum from EventType enum', () => {
    expect(toEventNameReadable('TimerStarted')).toBe('TimerStarted');
  });
});

describe('toWorkflowTaskFailureReadable', () => {
  it('should return UnhandledCommand enum from WorkflowTaskFailedCause enum', () => {
    expect(
      toWorkflowTaskFailureReadable(
        'WORKFLOW_TASK_FAILED_CAUSE_UNHANDLED_COMMAND',
      ),
    ).toBe('UnhandledCommand');
  });
  it('should return Unspecified enum if no cause', () => {
    expect(toWorkflowTaskFailureReadable()).toBe('Unspecified');
  });
});
