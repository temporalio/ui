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

<Card
  class="w-full rounded-none border-0 border-b border-subtle px-0 py-4 last:border-b-0"
>
  <h2 class="text-lg font-semibold">
    {translate('schedules.policies-heading')}
  </h2>
  <div class="mt-3 flex flex-col gap-3">
    <p class="text-sm text-secondary">
      {translate('schedules.policies-description')}
      <Link href="https://docs.temporal.io/schedule#policies" newTab>
        {translate('schedules.policies-learn-more')}
      </Link>
    </p>

    <dl
      class="flex flex-col gap-y-2 sm:grid sm:grid-cols-[minmax(7rem,10rem)_minmax(0,1fr)] sm:grid-rows-none sm:gap-x-3 sm:gap-y-2"
    >
      <div class="sm:contents">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('schedules.overlap-policy')}
        </dt>
        <dd class="min-w-0 text-sm leading-5">
          {overlapPolicyContent[$form.overlapPolicy].label}
        </dd>
      </div>

      <div class="sm:contents">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('schedules.on-start-behavior')}
        </dt>
        <dd class="min-w-0 text-sm leading-5">{onStartBehavior}</dd>
      </div>

      <div class="sm:contents">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('schedules.catchup-window-policy')}
        </dt>
        <dd class="min-w-0 text-sm leading-5">
          {$form.catchupWindow
            ? formatDuration($form.catchupWindow)
            : translate('schedules.catchup-window-default')}
        </dd>
      </div>

      <div class="sm:contents">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('schedules.pause-on-failure-question')}
        </dt>
        <dd class="min-w-0 text-sm leading-5">
          {$form.pauseOnFailure
            ? translate('common.yes')
            : translate('common.no')}
        </dd>
      </div>

      <div class="sm:contents">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('schedules.timeouts')}
        </dt>
        <dd class="min-w-0 text-sm leading-5">{timeoutsSummary}</dd>
      </div>
    </dl>
    <div class="mr-auto mt-2">
      <Button
        bind:this={editPoliciesButton}
        variant="secondary"
        onclick={() => (isEditingPolicies = true)}
        >{translate('schedules.policies-title')}</Button
      >
    </div>
  </div>
  <SchedulesPoliciesDrawer bind:isOpen={isEditingPolicies} {form} />
</Card>
