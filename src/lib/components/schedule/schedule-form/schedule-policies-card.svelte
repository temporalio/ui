<script lang="ts">
  import { untrack } from 'svelte';
  import { type SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { formatDuration } from '$lib/utilities/format-time';

  import { overlapPolicyContent } from './constants';
  import type { ScheduleFormData } from './schema';

  import SchedulesPoliciesDrawer from './schedule-policies-drawer.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
  }

  let { form }: Props = $props();

  let isEditingPolicies = $state(false);

  const onStartBehavior = $derived(
    $form.pauseSchedule ? 'Pause on start' : 'Do not pause on start',
  );

  const timeoutsSummary = $derived(
    [
      $form.taskTimeout &&
        `Task: ${formatDuration($form.taskTimeout) || '0 seconds'}`,
      $form.runTimeout &&
        `Run: ${formatDuration($form.runTimeout) || '0 seconds'}`,
      $form.executionTimeout &&
        `Execution: ${formatDuration($form.executionTimeout) || '0 seconds'}`,
    ]
      .filter(Boolean)
      .join(', ') || 'No timeouts set',
  );

  let editPoliciesButton: { focus: () => void };

  let wasEditingPolicies = false;
  $effect(() => {
    if (!isEditingPolicies && wasEditingPolicies) {
      untrack(() => editPoliciesButton?.focus());
    }
    wasEditingPolicies = isEditingPolicies;
  });
</script>

<div class="flex flex-col gap-1">
  <h2 class="text-3xl font-medium">Schedule Policies</h2>

  <p class="text-secondary">
    Schedule policies allow you to customize Schedule and Workflow behavior.
    <Link href="https://docs.temporal.io/schedule#policies" newTab>
      Read more about Schedule policies
    </Link>
  </p>
</div>

<Card class="w-full">
  <div class="flex flex-col gap-4">
    <dl
      class="flex flex-col gap-y-4 lg:grid lg:grid-cols-[max-content,1fr] lg:grid-rows-none lg:gap-x-6 lg:gap-y-2"
    >
      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Overlap Policy</dt>
        <dd>
          {overlapPolicyContent[$form.overlapPolicy].label}
        </dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">On Start Behavior</dt>
        <dd>{onStartBehavior}</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Catchup Window Policy</dt>
        <dd>
          {$form.catchupWindow ? formatDuration($form.catchupWindow) : '1 year'}
        </dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Pause on Failure?</dt>
        <dd>{$form.pauseOnFailure ? 'Yes' : 'No'}</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Timeouts</dt>
        <dd>{timeoutsSummary}</dd>
      </div>
    </dl>
    <div class="mr-auto mt-2">
      <Button
        bind:this={editPoliciesButton}
        variant="secondary"
        on:click={() => (isEditingPolicies = true)}
        >Edit Schedule Policies</Button
      >
    </div>
  </div>
  <SchedulesPoliciesDrawer bind:isOpen={isEditingPolicies} {form} />
</Card>
