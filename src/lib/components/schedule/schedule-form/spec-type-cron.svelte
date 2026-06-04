<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { ordinal } from '$lib/utilities/schedule-spec-label';

  import type { ScheduleFormData } from './schema';

  import CronExpressionFormatModal from './cron-expression-format-modal.svelte';
  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, errors, index }: Props = $props();

  const today = new Date();
  const weekday = today.toLocaleDateString(undefined, { weekday: 'long' });
  const weekdayNumber = today.getDay();
  const dayOfMonth = today.getDate();

  const shortcuts = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily', value: '0 0 * * *' },
    { label: `Every ${weekday}`, value: `0 0 * * ${weekdayNumber}` },
    {
      label: `Monthly on ${ordinal(dayOfMonth)}`,
      value: `0 0 ${dayOfMonth} * *`,
    },
  ];

  let isCronExpressionFormatModalOpen = $state(false);
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1">
    <Label label="Cron Shortcuts" />
    <div class="flex flex-wrap gap-2">
      {#each shortcuts as shortcut (shortcut.value)}
        <Button
          variant="secondary"
          on:click={() => ($form.specs[index].cronString = shortcut.value)}
          >{shortcut.label}</Button
        >
      {/each}
    </div>
  </div>
  <Input
    id="cron-string-{index}"
    label="Cron expression"
    bind:value={$form.specs[index].cronString}
    placeholder="* * * * *"
    required
    error={!!$errors.specs?.[index]?.cronString?.[0]}
    hintText={$errors.specs?.[index]?.cronString?.[0] ??
      'Format: minute (0-59) hour (0-23) day-of-month (1-31) month (1-12) day-of-week (0-6)'}
  />
  <button
    class="mr-auto underline hover:text-brand"
    onclick={() => (isCronExpressionFormatModalOpen = true)}
  >
    Formatting help
  </button>
  <CronExpressionFormatModal bind:open={isCronExpressionFormatModalOpen} />

  <ScheduleSpecPreview {form} {index} />
</div>
