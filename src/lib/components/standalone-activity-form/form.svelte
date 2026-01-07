<script lang="ts">
  import { writable } from 'svelte/store';

  import { onDestroy } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import z from 'zod/v3';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    encodings,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import { startStandaloneActivity } from '$lib/services/standalone-activities';
  import { getIdentity } from '$lib/utilities/core-context';

  import type { StandaloneActivityFormData } from './types';
  import Message from '../form/message.svelte';
  import PayloadInputWithEncoding from '../payload-input-with-encoding.svelte';
  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  interface Props {
    namespace: string;
  }

  const { namespace }: Props = $props();

  const formDefaults = $derived<StandaloneActivityFormData>({
    namespace,
    identity: getIdentity(),
    encoding: 'json/plain',
    activityId: page.url.searchParams.get('activityId') ?? '',
    activityType: page.url.searchParams.get('activityType') ?? '',
    taskQueue: page.url.searchParams.get('taskQueue') ?? '',
    startToCloseTimeout: page.url.searchParams.get('startToCloseTimeout') ?? '',
    scheduleToCloseTimeout:
      page.url.searchParams.get('scheduleToCloseTimeout') ?? '',
  });

  // https://svelte.dev/docs/svelte/compiler-warnings#state_referenced_locally
  const getFormDefaults = () => formDefaults;

  const schema = z
    .object({
      identity: z.string(),
      namespace: z.string(),
      activityId: z.string().min(1, { message: 'Activity ID is required.' }),
      taskQueue: z.string().min(1, { message: 'Task Queue is required.' }),
      activityType: z
        .string()
        .min(1, { message: 'Activity Type is required.' }),
      input: z.string().optional(),
      startToCloseTimeout: z.string().optional(),
      scheduleToCloseTimeout: z.string().optional(),
      encoding: z.enum(encodings).optional(),
      messageType: z.string().optional(),
      searchAttributes: z
        .array(
          z.object({ label: z.string(), value: z.string(), type: z.string() }),
        )
        .optional(),
      summary: z.string().optional(),
      details: z.string().optional(),
      scheduleToStartTimeout: z.string().optional(),
      heartbeatTimeout: z.number().optional(),
      retryPolicy: z
        .object({
          stuff: z.string(),
        })
        .optional(),
    })
    .superRefine((data, context) => {
      if (!data.startToCloseTimeout && !data.scheduleToCloseTimeout) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startToCloseTimeout'],
          message:
            'Either "Start to Close Timeout" or "Schedule to Close Timeout" is required.',
        });
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scheduleToCloseTimeout'],
          message:
            'Either "Start to Close Timeout" or "Schedule to Close Timeout" is required.',
        });
      }
    });

  const { form, enhance, errors, message } = superForm(
    {
      ...getFormDefaults(),
      input: '',
      messageType: '',
      scheduleToStartTimeout: '',
      searchAttributes: [],
      summary: '',
      details: '',
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
          startStandaloneActivity(form.data);
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

  const encoding = writable<PayloadInputEncoding>('json/plain');
  let advancedOptionsVisible = $state(false);

  const unsubscribe = encoding.subscribe((e) => {
    $form.encoding = e;
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  const generateRandomId = () => {
    $form.activityId = crypto.randomUUID();
  };
</script>

<form class="max-w-[45rem] space-y-4" use:enhance novalidate>
  <Message value={$message} />

  <Input
    class="grow"
    label="Activity ID"
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
      leadingIcon="retry">Random UUID</Button
    >
  </Input>

  <Input
    id="taskQueue"
    required
    label="Task Queue"
    bind:value={$form.taskQueue}
    error={!!$errors.taskQueue}
    hintText={$errors.taskQueue?.[0]}
  />
  <Input
    id="activityType"
    required
    label="Activity Type"
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
    <p class="text-base font-medium">Activity Timeouts</p>

    <DurationInput
      id="startToCloseTimeout"
      label="Start to Close Timeout"
      required={!$form.scheduleToCloseTimeout}
      hintText="Maximum time an activity is allowed to execute after being picked up by a worker."
      bind:value={$form.startToCloseTimeout}
    />

    <DurationInput
      id="scheduleToCloseTimeout"
      label="Schedule to Close Timeout"
      required={!$form.startToCloseTimeout}
      hintText="How long the caller is willing to wait for an activity completion."
      bind:value={$form.scheduleToCloseTimeout}
    />

    <DurationInput
      id="scheduleToStartTimeout"
      label="Schedule to Start Timeout"
      hintText={'Limits time an activity task can stay in a task queue before a worker picks it up. Defaults to "Schedule to Close Timeout" if not specified.'}
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
        <p class="text-base font-medium">Custom Search Attributes</p>
        <p class="text-secondary">
          Indexed fields used in a List Filter to filter a list of Standalone
          Activities.
        </p>
      </div>
      <AddSearchAttributes bind:attributesToAdd={$form.searchAttributes} />
    </Card>

    <Card
      class="space-y-4"
      data-testid="start-standalone-activity-add-metadata"
    >
      <div class="space-y-2">
        <p class="text-base font-medium">User Metadata</p>
        <p class="text-secondary">
          Add context to Standalone Activities to help identify and understand
          its operations.
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
      {translate('activities.start-standalone-activity')}
    </Button>
  </div>
</form>
