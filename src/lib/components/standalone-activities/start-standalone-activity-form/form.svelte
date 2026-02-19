<script lang="ts">
  import { writable } from 'svelte/store';

  import { onDestroy, onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import z from 'zod/v3';

  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    encodings,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import { getActivityPollers } from '$lib/services/pollers-service';
  import { startStandaloneActivity } from '$lib/services/standalone-activities';
  import type { SearchAttributeInput } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import {
    activityIDConflictPolicyOptions,
    activityIDReusePolicyOptions,
  } from '$lib/types/activity-execution';
  import { getIdentity } from '$lib/utilities/core-context';
  import {
    routeForStandaloneActivityDetails,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import type { StandaloneActivityFormDefaults } from './types';
  import Message from '../../form/message.svelte';
  import PayloadInputWithEncoding from '../../payload-input-with-encoding.svelte';
  import RetryPolicyInput from '../../retry-policy-input.svelte';
  import AddSearchAttributes from '../../workflow/add-search-attributes.svelte';

  interface Props {
    namespace: string;
  }

  const { namespace }: Props = $props();
  const taskQueueParam = page.url.searchParams.get('taskQueue') ?? '';

  const formDefaults = $derived<StandaloneActivityFormDefaults>({
    namespace,
    identity: getIdentity(),
    encoding: 'json/plain',
    activityId: page.url.searchParams.get('activityId') ?? '',
    activityType: page.url.searchParams.get('activityType') ?? '',
    taskQueue: taskQueueParam,
    startToCloseTimeout: page.url.searchParams.get('startToCloseTimeout') ?? '',
    scheduleToCloseTimeout:
      page.url.searchParams.get('scheduleToCloseTimeout') ?? '',
  });

  const encoding = writable<PayloadInputEncoding>('json/plain');

  let searchAttributes = $state<SearchAttributeInput[]>([]);
  let taskQueueActive = $state<boolean | null>(null);
  let advancedOptionsVisible = $state(false);

  const schema = z
    .object({
      identity: z.string(),
      namespace: z.string(),
      activityId: z.string().min(1, {
        message: translate('standalone-activities.form-activity-id-required'),
      }),
      taskQueue: z.string().min(1, {
        message: translate('standalone-activities.form-task-queue-required'),
      }),
      activityType: z.string().min(1, {
        message: translate('standalone-activities.form-activity-type-required'),
      }),
      input: z.string().optional(),
      startToCloseTimeout: z.string().optional(),
      scheduleToCloseTimeout: z.string().optional(),
      encoding: z.enum(encodings).optional(),
      messageType: z.string().optional(),
      summary: z.string().optional(),
      details: z.string().optional(),
      scheduleToStartTimeout: z.string().optional(),
      heartbeatTimeout: z.string().optional(),
      initialInterval: z.string().optional(),
      backoffCoefficient: z.number().optional().nullable(),
      maximumInterval: z.string().optional(),
      maximumAttempts: z.number().optional().nullable(),
      idReusePolicy: z.string().optional(),
      idConflictPolicy: z.string().optional(),
    })
    .superRefine((data, context) => {
      if (!data.startToCloseTimeout && !data.scheduleToCloseTimeout) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startToCloseTimeout'],
          message: translate('standalone-activities.form-timeout-required'),
        });
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scheduleToCloseTimeout'],
          message: translate('standalone-activities.form-timeout-required'),
        });
      }
    });

  const { form, enhance, errors, message } = superForm(
    {
      ...formDefaults,
      input: '',
      messageType: '',
      scheduleToStartTimeout: '',
      summary: '',
      details: '',
      heartbeatTimeout: '',
      initialInterval: '',
      backoffCoefficient: undefined,
      maximumInterval: '',
      maximumAttempts: undefined,
      idReusePolicy: '',
      idConflictPolicy: '',
    },
    {
      SPA: true,
      dataType: 'json',
      resetForm: false,
      invalidateAll: false,
      validators: zodClient(schema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          const { runId } = await startStandaloneActivity({
            ...form.data,
            searchAttributes,
          });
          toaster.push({
            duration: 5000,
            variant: 'success',
            message: translate('standalone-activities.form-activity-started'),
            link: routeForStandaloneActivityDetails({
              namespace,
              activityId: form.data.activityId,
              runId,
            }),
          });
          return { type: 'success' };
        } catch (error) {
          console.error(error);
          return {
            type: 'error',
          };
        }
      },
    },
  );

  const unsubscribe = encoding.subscribe((e) => {
    $form.encoding = e;
  });

  onMount(() => {
    checkTaskQueue(taskQueueParam);
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  const generateRandomId = () => {
    $form.activityId = crypto.randomUUID();
  };

  const checkTaskQueue = async (queue: string) => {
    if (!queue) return;
    taskQueueActive = null;
    const response = await getActivityPollers({ namespace, queue });
    if (response.pollers && response.pollers.length > 0) {
      taskQueueActive = true;
    } else {
      taskQueueActive = false;
    }
  };
</script>

<form class="max-w-[45rem] space-y-4" use:enhance novalidate>
  <Message value={$message} />

  <Input
    class="grow"
    label={translate('standalone-activities.form-activity-id-label')}
    required
    id="activityId"
    bind:value={$form.activityId}
    error={!!$errors?.activityId}
    hintText={$errors?.activityId?.[0]}
  >
    <Button
      class="ml-2.5"
      variant="secondary"
      slot="after-input"
      on:click={generateRandomId}
      leadingIcon="retry"
      >{translate('standalone-activities.form-random-uuid')}</Button
    >
  </Input>

  <Input
    id="taskQueue"
    required
    label={translate('standalone-activities.form-task-queue-label')}
    bind:value={$form.taskQueue}
    error={!!$errors.taskQueue}
    hintText={$errors.taskQueue?.[0]}
    on:blur={() => checkTaskQueue($form.taskQueue)}
  />
  {#if taskQueueActive !== null}
    <Alert
      intent={taskQueueActive ? 'success' : 'error'}
      title={taskQueueActive
        ? 'Task Queue is active'
        : 'Task Queue is inactive'}
    >
      <div class="flex w-full items-center justify-between">
        <Link
          href={routeForTaskQueue({ namespace, queue: $form.taskQueue })}
          newTab
        >
          View Task Queue
        </Link>
      </div>
    </Alert>
  {/if}
  <Input
    id="activityType"
    required
    label={translate('standalone-activities.form-activity-type-label')}
    bind:value={$form.activityType}
    error={!!$errors.activityType}
    hintText={$errors.activityType?.[0]}
  />

  <PayloadInputWithEncoding
    bind:input={$form.input}
    bind:messageType={$form.messageType}
    {encoding}
  />

  <Card
    class={twMerge(
      'space-y-4',
      $errors.startToCloseTimeout ? 'border-danger' : '',
    )}
  >
    <h5>{translate('standalone-activities.form-timeouts-heading')}</h5>

    <DurationInput
      id="startToCloseTimeout"
      label={translate(
        'standalone-activities.form-start-to-close-timeout-label',
      )}
      required={!$form.scheduleToCloseTimeout}
      hintText={translate(
        'standalone-activities.form-start-to-close-timeout-hint',
      )}
      bind:value={$form.startToCloseTimeout}
    />

    <DurationInput
      id="scheduleToCloseTimeout"
      label={translate(
        'standalone-activities.form-schedule-to-close-timeout-label',
      )}
      required={!$form.startToCloseTimeout}
      hintText={translate(
        'standalone-activities.form-schedule-to-close-timeout-hint',
      )}
      bind:value={$form.scheduleToCloseTimeout}
    />

    <DurationInput
      id="scheduleToStartTimeout"
      label={translate(
        'standalone-activities.form-schedule-to-start-timeout-label',
      )}
      hintText={translate(
        'standalone-activities.form-schedule-to-start-timeout-hint',
      )}
      bind:value={$form.scheduleToStartTimeout}
    />

    {#if $errors.startToCloseTimeout}
      <p class="text-xs text-danger">
        {$errors.startToCloseTimeout}
      </p>
    {/if}
  </Card>

  {#if advancedOptionsVisible}
    <Card
      class="space-y-4"
      data-testid="start-standalone-activity-add-search-attributes"
    >
      <div class="space-y-2">
        <h5>
          {translate('standalone-activities.form-search-attributes-heading')}
        </h5>
        <p class="text-secondary">
          {translate(
            'standalone-activities.form-search-attributes-description',
          )}
        </p>
      </div>
      <AddSearchAttributes
        variant="secondary"
        bind:attributesToAdd={searchAttributes}
      />
    </Card>

    <Card
      class="space-y-4"
      data-testid="start-standalone-activity-add-metadata"
    >
      <div class="space-y-2">
        <h5>{translate('standalone-activities.form-user-metadata-heading')}</h5>
        <p class="text-secondary">
          {translate('standalone-activities.form-user-metadata-description')}
        </p>
      </div>
      <div class="space-y-2">
        <Label label={translate('workflows.summary')} for="summary" />
        <MarkdownEditor bind:content={$form.summary} />
      </div>
      <div class="space-y-2">
        <Label label={translate('workflows.details')} for="details" />
        <MarkdownEditor bind:content={$form.details} />
      </div>
    </Card>

    <Card class="space-y-4">
      <h5>{translate('standalone-activities.form-retry-policy-heading')}</h5>
      <RetryPolicyInput
        bind:initialInterval={$form.initialInterval}
        bind:backoffCoefficient={$form.backoffCoefficient}
        bind:maximumInterval={$form.maximumInterval}
        bind:maximumAttempts={$form.maximumAttempts}
      />
    </Card>

    <Card>
      <DurationInput
        id="heartbeatTimeout"
        label={translate('standalone-activities.form-heartbeat-timeout-label')}
        hintText={translate(
          'standalone-activities.form-heartbeat-timeout-hint',
        )}
        bind:value={$form.heartbeatTimeout}
      />
    </Card>

    <Card class="space-y-4">
      <h5>{translate('standalone-activities.form-id-policies-heading')}</h5>

      <Select
        label={translate('standalone-activities.form-id-reuse-policy-label')}
        id="start-standalone-activity-id-reuse-policy-select"
        bind:value={$form.idReusePolicy}
      >
        {#each activityIDReusePolicyOptions as option}
          <Option value={option}
            >{fromScreamingEnum(option, 'ActivityIdReusePolicy')}</Option
          >
        {/each}
      </Select>

      <Select
        label={translate('standalone-activities.form-id-conflict-policy-label')}
        id="start-standalone-activity-id-conflict-policy-select"
        bind:value={$form.idConflictPolicy}
      >
        {#each activityIDConflictPolicyOptions as option}
          <Option value={option}
            >{fromScreamingEnum(option, 'ActivityIdConflictPolicy')}</Option
          >
        {/each}
      </Select>
    </Card>
  {/if}

  <div class="flex items-center justify-between">
    <Button
      type="button"
      variant="ghost"
      trailingIcon={advancedOptionsVisible ? 'chevron-up' : 'chevron-down'}
      data-testid="start-standalone-activity-more-options"
      on:click={() => (advancedOptionsVisible = !advancedOptionsVisible)}
    >
      {translate('common.more-options')}
    </Button>

    <Button data-testid="start-standalone-activity-submit-button" type="submit">
      {translate('standalone-activities.start-standalone-activity')}
    </Button>
  </div>
</form>
