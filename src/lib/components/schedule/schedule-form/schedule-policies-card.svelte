<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';

  import type { ScheduleFormData } from './schema';

  interface Props {
    form: Writable<ScheduleFormData>;
  }

  let { form }: Props = $props();

  let editing = $state(false);

  const overlapPolicyLabels: Record<string, string> = {
    Unspecified: 'Unspecified',
    Skip: 'Skip',
    BufferOne: 'Buffer one',
    BufferAll: 'Buffer all',
    CancelOther: 'Cancel other',
    TerminateOther: 'Terminate other',
    AllowAll: 'Allow all',
  };

  const toggleEdit = () => {
    editing = !editing;
  };
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Policies</h2>
  <p class="mt-1 text-xs text-secondary">
    Schedule policies allow you to customize Schedule and Workflow behavior.
    <Link href="https://docs.temporal.io/schedules#policies" newTab>
      Read more about Schedule policies
    </Link>
  </p>

  {#if editing}
    <div class="mt-4 flex flex-col gap-4">
      <Select
        id="overlap-policy"
        label="Overlap Policy"
        value={$form.overlapPolicy}
        onChange={(value) => {
          $form.overlapPolicy = String(value) as typeof $form.overlapPolicy;
        }}
      >
        {#each Object.entries(overlapPolicyLabels) as [value, label] (value)}
          <Option {value}>{label}</Option>
        {/each}
      </Select>
      <DurationInput
        id="catchup-window"
        label="Catchup Window"
        bind:value={$form.catchupWindow}
      />
      <Checkbox
        id="pause-on-failure"
        label="Pause on Failure"
        checked={$form.pauseOnFailure}
        on:change={() => ($form.pauseOnFailure = !$form.pauseOnFailure)}
      />
      <Checkbox
        id="keep-original-workflow-id"
        label="Keep Original Workflow ID"
        checked={$form.keepOriginalWorkflowId}
        on:change={() =>
          ($form.keepOriginalWorkflowId = !$form.keepOriginalWorkflowId)}
      />
      <Button variant="secondary" on:click={toggleEdit}>Done</Button>
    </div>
  {:else}
    <ul class="mt-4 flex flex-col gap-2">
      <li
        class="flex items-center justify-between border-b border-subtle py-2 text-sm"
      >
        <span>Overlap Policy</span>
        <span class="surface-subtle rounded px-2 py-0.5"
          >{overlapPolicyLabels[$form.overlapPolicy] ||
            $form.overlapPolicy}</span
        >
      </li>
      <li
        class="flex items-center justify-between border-b border-subtle py-2 text-sm"
      >
        <span>Catchup Window Policy</span>
        <span class="surface-subtle rounded px-2 py-0.5"
          >{$form.catchupWindow || '1 year'}</span
        >
      </li>
      <li
        class="flex items-center justify-between border-b border-subtle py-2 text-sm"
      >
        <span>Pause on Failure?</span>
        <span class="surface-subtle rounded px-2 py-0.5"
          >{$form.pauseOnFailure ? 'Yes' : 'No'}</span
        >
      </li>
    </ul>
    <div class="mt-4">
      <Button variant="secondary" on:click={toggleEdit}
        >Edit Schedule Policies</Button
      >
    </div>
  {/if}
</Card>
