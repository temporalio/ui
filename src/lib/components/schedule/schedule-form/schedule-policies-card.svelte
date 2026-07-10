<script lang="ts">
  import { untrack } from 'svelte';
  import { type SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { formatDuration } from '$lib/utilities/format-time';

  import { getOverlapPolicyContent } from '../constants';
  import type { FormScheduleSchema } from '../schema/form';

  import SchedulesPoliciesDrawer from './schedule-policies-drawer.svelte';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
  }

  let { form }: Props = $props();

  const overlapPolicyContent = getOverlapPolicyContent();

  let isEditingPolicies = $state(false);

  const onStartBehavior = $derived(
    $form.pauseSchedule
      ? translate('schedules.pause-on-start')
      : translate('schedules.do-not-pause-on-start'),
  );

  const timeoutsSummary = $derived(
    [
      $form.taskTimeout &&
        translate('schedules.timeout-task', {
          duration:
            formatDuration($form.taskTimeout) ||
            translate('schedules.zero-duration'),
        }),
      translate('schedules.timeout-run', {
        duration:
          formatDuration($form.runTimeout) ||
          translate('schedules.zero-duration'),
      }),
      translate('schedules.timeout-execution', {
        duration:
          formatDuration($form.executionTimeout) ||
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
    {translate('schedules.policies-heading')}
  </h2>
  <div class="mt-4 flex flex-col gap-4">
    <p class="text-sm text-secondary">
      {translate('schedules.policies-description')}
      <Link href="https://docs.temporal.io/schedule#policies" newTab>
        {translate('schedules.policies-learn-more')}
      </Link>
    </p>

    <dl
      class="flex flex-col gap-y-4 lg:grid lg:grid-cols-[max-content,1fr] lg:grid-rows-none lg:gap-x-6 lg:gap-y-2"
    >
      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">
          {translate('schedules.overlap-policy')}
        </dt>
        <dd>
          {overlapPolicyContent[$form.overlapPolicy].label}
        </dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">
          {translate('schedules.on-start-behavior')}
        </dt>
        <dd>{onStartBehavior}</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">
          {translate('schedules.catchup-window-policy')}
        </dt>
        <dd>
          {$form.catchupWindow
            ? formatDuration($form.catchupWindow)
            : translate('schedules.catchup-window-default')}
        </dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">
          {translate('schedules.pause-on-failure-question')}
        </dt>
        <dd>
          {$form.pauseOnFailure
            ? translate('common.yes')
            : translate('common.no')}
        </dd>
      </div>

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
        on:click={() => (isEditingPolicies = true)}
        >{translate('schedules.policies-title')}</Button
      >
    </div>
  </div>
  <SchedulesPoliciesDrawer bind:isOpen={isEditingPolicies} {form} />
</Card>
