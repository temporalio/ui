<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, waitFor, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import type { Failure, PendingWorkflowTaskInfo } from '$lib/types';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';

  import { redesignVisualParameters } from '../../../../.storybook/visual-modes';

  import WorkflowError from './workflow-error.svelte';

  const stackTrace = (scope: string, frames = 16) =>
    Array.from(
      { length: frames },
      (_, index) =>
        `at ${scope}.frame${index + 1} (/app/workflows/${scope}.ts:${index + 12}:${index + 3})`,
    ).join('\n');

  const nestedFailure: Failure = {
    message:
      'Unable to persist the Workflow Task because the Search Attributes update was rejected.',
    source: 'TypeScriptSDK',
    stackTrace: stackTrace('updateSearchAttributes'),
    cause: {
      message:
        'The visibility request failed validation for CustomDatetimeField.',
      source: 'TemporalServer',
      stackTrace: stackTrace('visibilityValidation'),
      cause: {
        message:
          'BadSearchAttributes: Namespace default has no mapping defined for Search Attribute CustomDatetimeField.',
        source: 'FrontendService',
        stackTrace: stackTrace('searchAttributeMapper'),
      },
    },
  };

  const failedEventAttributes = {
    type: 'workflowTaskFailedEventAttributes' as const,
    scheduledEventId: '2',
    startedEventId: '3',
    cause: 'BadSearchAttributes' as const,
    failure: nestedFailure,
    identity: 'checkout-worker@worker-a',
  };

  const failedEvent = {
    eventId: '4',
    eventTime: '2026-08-16T21:20:45.560000000Z',
    eventType: 'WorkflowTaskFailed',
    version: '0',
    taskId: '943857219',
    workflowTaskFailedEventAttributes: failedEventAttributes,
    attributes: failedEventAttributes,
    classification: 'Failed',
    category: 'workflow',
    id: '4',
    name: 'WorkflowTaskFailed',
    timestamp: 'Aug 16, 2026, 9:20:45.56 PM CDT',
  } as unknown as WorkflowTaskFailedEvent;

  const pendingTask = {
    state: 'PENDING_WORKFLOW_TASK_STATE_STARTED',
    attempt: 7,
    originalScheduledTime: '2026-08-16T21:20:40.310000000Z',
    scheduledTime: '2026-08-16T21:20:44.980000000Z',
    startedTime: '2026-08-16T21:20:45.120000000Z',
  } as unknown as PendingWorkflowTaskInfo;

  const timeoutEventAttributes = {
    type: 'workflowTaskTimedOutEventAttributes' as const,
    scheduledEventId: '22',
    startedEventId: '23',
    timeoutType: 'StartToClose' as const,
  };

  const timeoutEvent = {
    eventId: '24',
    eventTime: '2026-08-16T21:24:02.900000000Z',
    eventType: 'WorkflowTaskTimedOut',
    version: '0',
    taskId: '943857341',
    workflowTaskTimedOutEventAttributes: timeoutEventAttributes,
    attributes: timeoutEventAttributes,
    classification: 'TimedOut',
    category: 'workflow',
    id: '24',
    name: 'WorkflowTaskTimedOut',
    timestamp: 'Aug 16, 2026, 9:24:02.90 PM CDT',
  } as unknown as WorkflowTaskTimedOutEvent;

  const missingTimestampPendingTask = {
    state: 'PENDING_WORKFLOW_TASK_STATE_SCHEDULED',
    attempt: 2,
  } as unknown as PendingWorkflowTaskInfo;

  const { Story } = defineMeta({
    title: 'Workflows/Workflow Task Diagnostic',
    component: WorkflowError,
    parameters: {
      layout: 'padded',
    },
    argTypes: {
      error: { table: { disable: true } },
      pendingTask: { table: { disable: true } },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof WorkflowError>)}
  <div class="mx-auto w-full max-w-[90rem]">
    <WorkflowError {...args} />
  </div>
{/snippet}

<Story
  name="Nested Failure With Pending Task"
  args={{ error: failedEvent, pendingTask }}
  parameters={redesignVisualParameters}
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByTestId('workflow-task-alert');
    const diagnostic = await canvas.findByTestId(
      'workflow-task-failure-diagnostic',
    );

    await step('Present one cause-first diagnostic surface', async () => {
      expect(alert).toBeInTheDocument();
      expect(
        within(alert).getByRole('heading', {
          name: 'Bad Search Attributes',
        }),
      ).toBeInTheDocument();
      expect(within(alert).getAllByText('Failure diagnostic')).toHaveLength(1);
      expect(alert.querySelector('[aria-expanded]')).not.toBeInTheDocument();
      expect(
        alert.querySelector('[data-track-name="accordion"]'),
      ).not.toBeInTheDocument();
    });

    await step('Keep the complete nested failure in causal order', async () => {
      await waitFor(() => {
        expect(diagnostic).toHaveTextContent(
          'Unable to persist the Workflow Task because the Search Attributes update was rejected.',
        );
        expect(diagnostic).toHaveTextContent(
          'The visibility request failed validation for CustomDatetimeField.',
        );
        expect(diagnostic).toHaveTextContent(
          'Namespace default has no mapping defined for Search Attribute CustomDatetimeField.',
        );
      });

      const content = diagnostic.textContent ?? '';
      const outerMessage = content.indexOf('Unable to persist');
      const nestedMessage = content.indexOf('visibility request failed');
      const rootMessage = content.indexOf('Namespace default has no mapping');

      expect(outerMessage).toBeGreaterThanOrEqual(0);
      expect(nestedMessage).toBeGreaterThan(outerMessage);
      expect(rootMessage).toBeGreaterThan(nestedMessage);
      expect(content.match(/Caused by:/g)).toHaveLength(2);
    });

    await step('Expose copy, maximize, and semantic task details', async () => {
      expect(
        await canvas.findByTitle('Click to copy content'),
      ).toBeInTheDocument();
      expect(await canvas.findByTitle('Maximize')).toBeInTheDocument();

      const details = canvas.getByLabelText('Workflow task failure details');
      expect(details.tagName).toBe('DL');
      expect(within(details).getByText('Started').tagName).toBe('DD');
      expect(within(details).getByText('7').tagName).toBe('DD');
    });
  }}
/>

<Story
  name="Timeout Without Failure Or Pending Task"
  args={{ error: timeoutEvent, pendingTask: undefined }}
  parameters={redesignVisualParameters}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByTestId('workflow-task-alert');

    expect(
      within(alert).getByRole('heading', { name: 'Workflow Task Timed Out' }),
    ).toBeInTheDocument();
    expect(within(alert).getByText('Timeout Type')).toBeInTheDocument();
    expect(within(alert).getByText('StartToClose')).toBeInTheDocument();
    expect(
      within(alert).queryByTestId('workflow-task-failure-diagnostic'),
    ).not.toBeInTheDocument();
    expect(
      within(alert).queryByText('Pending Workflow Task'),
    ).not.toBeInTheDocument();
    expect(alert.querySelector('[aria-expanded]')).not.toBeInTheDocument();
  }}
/>

<Story
  name="Missing Optional Pending Timestamps"
  args={{ error: failedEvent, pendingTask: missingTimestampPendingTask }}
  parameters={{
    ...redesignVisualParameters,
    viewport: { defaultViewport: 'redesignMobile' },
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const details = await canvas.findByLabelText(
      'Workflow task failure details',
    );

    expect(within(details).getByText('State')).toBeInTheDocument();
    expect(within(details).getByText('Attempt')).toBeInTheDocument();
    expect(
      within(details).queryByText('Original Scheduled Time'),
    ).not.toBeInTheDocument();
    expect(
      within(details).queryByText('Scheduled Time'),
    ).not.toBeInTheDocument();
    expect(within(details).queryByText('Started Time')).not.toBeInTheDocument();
  }}
/>
