<script lang="ts">
  import { untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';
  import { formatDuration } from '$lib/utilities/format-time';

  import type { FormWorkflowPolicies } from './schema';

  import WorkflowPoliciesDrawer from './workflow-policies-drawer.svelte';

  interface Props {
    policies: FormWorkflowPolicies;
    onUpdate: (policies: FormWorkflowPolicies) => void;
  }

  let { policies, onUpdate }: Props = $props();

  let isEditingPolicies = $state(false);

  const timeoutsSummary = $derived(
    [
      policies.taskTimeout &&
        translate('schedules.timeout-task', {
          duration:
            formatDuration(policies.taskTimeout) ||
            translate('schedules.zero-duration'),
        }),
      translate('schedules.timeout-run', {
        duration:
          formatDuration(policies.runTimeout) ||
          translate('schedules.zero-duration'),
      }),
      translate('schedules.timeout-execution', {
        duration:
          formatDuration(policies.executionTimeout) ||
          translate('schedules.zero-duration'),
      }),
    ]
      .filter(Boolean)
      .join(', ') || translate('schedules.no-timeouts'),
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

<Card class="w-full">
  <h2 class="text-2xl font-medium">
    {translate('schedules.workflow-policies-heading')}
  </h2>
  <div class="mt-4 flex flex-col gap-4">
    <p class="text-sm text-secondary">
      {translate('schedules.timeouts-description')}
    </p>
    <dl
      class="flex flex-col gap-y-4 lg:grid lg:grid-cols-[max-content,1fr] lg:grid-rows-none lg:gap-x-6 lg:gap-y-2"
    >
      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">
          {translate('schedules.timeouts')}
        </dt>
        <dd>{timeoutsSummary}</dd>
      </div>
    </dl>
    <div class="mr-auto mt-2">
      <Button
        bind:this={editPoliciesButton}
        variant="secondary"
        onclick={() => (isEditingPolicies = true)}
        >{translate('schedules.workflow-policies-title')}</Button
      >
    </div>
  </div>
  <WorkflowPoliciesDrawer
    bind:isOpen={isEditingPolicies}
    {policies}
    {onUpdate}
  />
</Card>
