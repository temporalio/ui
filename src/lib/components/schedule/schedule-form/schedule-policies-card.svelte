<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { get, writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';

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
      <div>
        <label for="overlap-policy" class="text-sm font-medium"
          >Overlap Policy</label
        >
        <select
          id="overlap-policy"
          class="surface-primary mt-1 w-full rounded border border-subtle px-3 py-2 text-sm"
          bind:value={$form.overlapPolicy}
        >
          {#each Object.entries(overlapPolicyLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
      </div>
      <Input
        id="catchup-window"
        label="Catchup Window"
        bind:value={$form.catchupWindow}
        hintText="Duration string, e.g. 8760h (1 year)"
      />
      <Checkbox
        id="pause-on-failure"
        label="Pause on Failure"
        bind:checked={$form.pauseOnFailure}
      />
      <Checkbox
        id="keep-original-workflow-id"
        label="Keep Original Workflow ID"
        bind:checked={$form.keepOriginalWorkflowId}
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
