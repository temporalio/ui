<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import type { FullSchedule } from '$lib/types/schedule';

  import type { ScheduleFormData } from './schema';

  import ScheduleInputPayload from './schedule-input-payload.svelte';

  interface Props {
    form: Writable<ScheduleFormData>;
    errors: Record<string, string[] | undefined> | Record<string, unknown>;
    schedule?: FullSchedule | null;
  }

  let { form, errors, schedule = null }: Props = $props();

  const endDateType = $derived($form.endDateType);
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Details</h2>
  <div class="mt-4 flex flex-col gap-4">
    <Input
      id="name"
      bind:value={$form.name}
      data-testid="schedule-name-input"
      label="Schedule Name"
      error={!!errors.name?.[0]}
      hintText={errors.name?.[0]}
      maxLength={232}
      disabled={Boolean(schedule)}
      required
    />
    <Input
      id="workflowType"
      bind:value={$form.workflowType}
      data-testid="schedule-type-input"
      label="Workflow Type"
      error={!!errors.workflowType?.[0]}
      hintText={errors.workflowType?.[0]}
      required
    />
    <Input
      id="workflowId"
      bind:value={$form.workflowId}
      data-testid="schedule-workflow-id-input"
      label="Workflow ID"
      hintText={errors.workflowId?.[0] ||
        'The unique ID of the Workflow Execution. If left blank, we will generate a unique ID.'}
      error={!!errors.workflowId?.[0]}
    />
    <Input
      id="taskQueue"
      bind:value={$form.taskQueue}
      data-testid="schedule-task-queue-input"
      label="Task Queue"
      error={!!errors.taskQueue?.[0]}
      hintText={errors.taskQueue?.[0]}
      required
    />

    <Input
      id="startDate"
      bind:value={$form.startDate}
      label="Schedule Start Date"
      placeholder="Today, {new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}"
    />

    <fieldset class="flex flex-col gap-2">
      <legend class="text-sm font-medium">End Date</legend>
      <label class="flex items-center gap-2">
        <input
          type="radio"
          name="endDateType"
          value="never"
          checked={endDateType === 'never'}
          on:change={() => ($form.endDateType = 'never')}
        />
        <span class="text-sm">Never</span>
      </label>
      <label class="flex items-center gap-2">
        <input
          type="radio"
          name="endDateType"
          value="on"
          checked={endDateType === 'on'}
          on:change={() => ($form.endDateType = 'on')}
        />
        <span class="text-sm">On</span>
        {#if endDateType === 'on'}
          <Input
            id="endDate"
            label="End date"
            bind:value={$form.endDate}
            placeholder="MM/DD/YY"
          />
        {/if}
      </label>
      <label class="flex items-center gap-2">
        <input
          type="radio"
          name="endDateType"
          value="after"
          checked={endDateType === 'after'}
          on:change={() => ($form.endDateType = 'after')}
        />
        <span class="text-sm">After</span>
        {#if endDateType === 'after'}
          <input
            id="endAfterOccurrences"
            type="number"
            class="surface-primary w-48 rounded border border-subtle px-3 py-2 text-sm"
            bind:value={$form.endAfterOccurrences}
            placeholder="### occurrences"
          />
        {/if}
      </label>
    </fieldset>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="timezoneName" class="text-sm font-medium">Timezone</label>
        <select
          id="timezoneName"
          class="surface-primary mt-1 w-full rounded border border-subtle px-3 py-2 text-sm"
          bind:value={$form.timezoneName}
        >
          <option value="UTC">UTC</option>
          {#each Intl.supportedValuesOf('timeZone') as tz}
            <option value={tz}>{tz}</option>
          {/each}
        </select>
      </div>
      <Input
        id="jitter"
        bind:value={$form.jitter}
        label="Jitter"
        placeholder="0 sec"
      />
    </div>

    <ScheduleInputPayload
      bind:input={$form.input}
      bind:editInput={$form.editInput}
      bind:encoding={$form.encoding}
      bind:messageType={$form.messageType}
      payloads={schedule?.action?.startWorkflow?.input}
      showEditActions={Boolean(schedule)}
    />
  </div>
</Card>
