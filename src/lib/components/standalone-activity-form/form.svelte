<script lang="ts">
  import { writable } from 'svelte/store';

  import { onDestroy } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import z from 'zod/v3';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    encodings,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import { startStandaloneActivity } from '$lib/services/standalone-activities';

  import PayloadInputWithEncoding from '../payload-input-with-encoding.svelte';
  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  interface Props {
    namespace: string;
  }

  const { namespace }: Props = $props();

  const schema = z.object({
    activityId: z.string(),
    taskQueue: z.string(),
    activityType: z.string(),
    input: z.string(),
    encoding: z.enum(encodings),
    searchAttributes: z.array(
      z.object({ label: z.string(), value: z.string(), type: z.string() }),
    ),
    summary: z.string(),
    details: z.string(),
  });

  const { form, enhance } = superForm(
    {
      activityId: '',
      taskQueue: '',
      activityType: '',
      input: '',
      encoding: '',
      searchAttributes: [],
      summary: '',
      details: '',
    },
    {
      SPA: true,
      dataType: 'json',
      resetForm: false,
      validators: zodClient(schema),
      onUpdate: async ({ form }) => {
        console.log(form);
        if (!form.valid) return;

        try {
          startStandaloneActivity(form.data, namespace);
        } catch (error) {
          console.error(error);
        }
      },
    },
  );

  const encoding = writable<PayloadInputEncoding>('json/plain');
  let messageType = $state('');
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

<form class="flex max-w-[45rem] flex-col gap-4" use:enhance>
  <div class="flex w-full items-end gap-2.5">
    <Input
      class="grow"
      label="Activity ID"
      required
      id="activityId"
      bind:value={$form.activityId}
    />
    <Button on:click={generateRandomId} leadingIcon="retry">Random UUID</Button>
  </div>
  <Input
    id="taskQueue"
    required
    label="Task Queue"
    bind:value={$form.taskQueue}
  />
  <Input
    id="activityType"
    required
    label="Activity Type"
    bind:value={$form.activityType}
  />
  <PayloadInputWithEncoding
    bind:input={$form.input}
    bind:messageType
    {encoding}
  />

  {#if advancedOptionsVisible}
    <Card class="space-y-4">
      <div class="space-y-2">
        <p class="text-base font-medium">Custom Search Attributes</p>
        <p class="text-secondary">
          Indexed fields used in a List Filter to filter a list of Standalone
          Activities.
        </p>
      </div>
      <AddSearchAttributes bind:attributesToAdd={$form.searchAttributes} />
    </Card>

    <Card class="space-y-4">
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
      on:click={() => (advancedOptionsVisible = !advancedOptionsVisible)}
    >
      {translate('common.more-options')}
    </Button>

    <Button type="submit">
      {translate('activities.start-standalone-activity')}
    </Button>
  </div>
</form>
