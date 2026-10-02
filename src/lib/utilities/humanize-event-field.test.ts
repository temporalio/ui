import { describe, expect, it } from 'vitest';

import {
  humanizeEnumValue,
  isConfigurationField,
} from './humanize-event-field';

describe('humanizeEnumValue', () => {
  it('drops the prefix the field name gives the enum', () => {
    expect(humanizeEnumValue('taskQueueKind', 'TASK_QUEUE_KIND_NORMAL')).toBe(
      'Normal',
    );
    expect(
      humanizeEnumValue('parentClosePolicy', 'PARENT_CLOSE_POLICY_TERMINATE'),
    ).toBe('Terminate');
    expect(
      humanizeEnumValue(
        'workflowIdReusePolicy',
        'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE',
      ),
    ).toBe('Allow duplicate');
  });

  it('strips through the field name when the enum is longer', () => {
    expect(
      humanizeEnumValue(
        'cause',
        'WORKFLOW_TASK_FAILED_CAUSE_WORKFLOW_WORKER_UNHANDLED_FAILURE',
      ),
    ).toBe('Workflow worker unhandled failure');
  });

  it('finds the field name inside a longer enum prefix', () => {
    expect(humanizeEnumValue('state', 'PENDING_ACTIVITY_STATE_STARTED')).toBe(
      'Started',
    );
  });

  it('reads an enum with an unrelated prefix as words', () => {
    expect(humanizeEnumValue('kind', 'EVENT_TYPE_UNSPECIFIED')).toBe(
      'Event type unspecified',
    );
  });

  it('leaves values that are not enums alone', () => {
    expect(humanizeEnumValue('workflowId', 'invoicing-acct-10001')).toBe(
      'invoicing-acct-10001',
    );
    expect(humanizeEnumValue('inheritBuildId', true)).toBe('true');
    expect(humanizeEnumValue('identity', 'WORKER')).toBe('WORKER');
  });
});

describe('isConfigurationField', () => {
  it('treats timeouts, policies and internal references as configuration', () => {
    for (const key of [
      'workflowTaskTimeout',
      'parentClosePolicy',
      'taskQueueKind',
      'workflowTaskCompletedEventId',
      'inheritBuildId',
      'retryPolicyInitialInterval',
      'retryPolicyMaximumAttempts',
    ]) {
      expect(isConfigurationField(key)).toBe(true);
    }
  });

  it('keeps what identifies and describes the event in front', () => {
    for (const key of [
      'workflowId',
      'workflowTypeName',
      'activityId',
      'attempt',
      'identity',
    ]) {
      expect(isConfigurationField(key)).toBe(false);
    }
  });
});
