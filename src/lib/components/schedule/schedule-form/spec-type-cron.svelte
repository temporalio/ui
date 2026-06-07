<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { getWeekdayLabel } from '$lib/i18n/format-date-names';
  import { translate } from '$lib/i18n/translate';

  import type { ScheduleFormData } from '../schema/schema';
  import { assertSpecType } from '../utilities/spec';

  import CronExpressionFormatModal from './cron-expression-format-modal.svelte';
  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, errors, index }: Props = $props();

  const spec = $derived(assertSpecType($form.specs[index], 'cron'));

  const today = new Date();
  const weekdayNumber = today.getDay();
  const dayOfMonth = today.getDate();

  const shortcuts = [
    {
      label: translate('schedules.cron-shortcut-every-minute'),
      value: '* * * * *',
    },
    {
      label: translate('schedules.cron-shortcut-every-hour'),
      value: '0 * * * *',
    },
    { label: translate('schedules.cron-shortcut-daily'), value: '0 0 * * *' },
    {
      label: translate('schedules.cron-shortcut-weekly', {
        weekday: getWeekdayLabel(weekdayNumber),
      }),
      value: `0 0 * * ${weekdayNumber}`,
    },
    {
      label: translate('schedules.cron-shortcut-monthly', {
        day: translate('common.ordinal', { count: dayOfMonth, ordinal: true }),
      }),
      value: `0 0 ${dayOfMonth} * *`,
    },
  ];

  let isCronExpressionFormatModalOpen = $state(false);
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1">
    <Label label={translate('schedules.cron-shortcuts')} />
    <div class="flex flex-wrap gap-2">
      {#each shortcuts as shortcut (shortcut.value)}
        <Button
          variant="secondary"
          on:click={() =>
            ($form.specs[index] = { ...spec, cronString: shortcut.value })}
          >{shortcut.label}</Button
        >
      {/each}
    </div>
  </div>
  <Input
    id="cron-string-{index}"
    label={translate('schedules.cron-expression-label')}
    bind:value={
      () => spec.cronString,
      (v) => ($form.specs[index] = { ...spec, cronString: v })
    }
    placeholder="* * * * *"
    required
    error={!!$errors.specs?.[index]?.cronString?.[0]}
    hintText={$errors.specs?.[index]?.cronString?.[0] ??
      translate('schedules.cron-format-hint')}
  />
  <button
    class="mr-auto underline hover:text-brand"
    onclick={() => (isCronExpressionFormatModalOpen = true)}
  >
    {translate('schedules.cron-formatting-help')}
  </button>
  <CronExpressionFormatModal bind:open={isCronExpressionFormatModalOpen} />

  <ScheduleSpecPreview {form} {index} />
</div>
