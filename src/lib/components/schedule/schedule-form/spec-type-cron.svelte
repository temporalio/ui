<script lang="ts">
  import cronstrue from 'cronstrue';
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import type { ScheduleFormData } from './schema';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
  }

  let { form, index }: Props = $props();

  const shortcuts = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily', value: '0 0 * * *' },
    { label: 'Every Monday', value: '0 0 * * 1' },
    { label: 'Monthly on 1st', value: '0 0 1 * *' },
  ];

  const preview = $derived.by(() => {
    try {
      return cronstrue.toString($form.specs[index].cronString || '* * * * *');
    } catch {
      return 'Invalid cron expression';
    }
  });
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap gap-2">
    {#each shortcuts as shortcut (shortcut.value)}
      <Button
        variant="ghost"
        size="xs"
        on:click={() => ($form.specs[index].cronString = shortcut.value)}
        >{shortcut.label}</Button
      >
    {/each}
  </div>

  <Input
    id="cron-string-{index}"
    label="Cron expression"
    bind:value={$form.specs[index].cronString}
    placeholder="* * * * *"
  />

  <p class="text-xs text-secondary">
    Format: minute (0-59) &nbsp; hour (0-23) &nbsp; day-of-month (1-31) &nbsp;
    month (1-12) &nbsp; day-of-week (0-6) &nbsp;
    <a
      href="https://crontab.guru"
      target="_blank"
      rel="noreferrer"
      class="text-primary underline">Formatting help</a
    >
  </p>

  <div class="surface-subtle rounded p-3">
    <p class="text-sm italic">{preview}</p>
  </div>
</div>
