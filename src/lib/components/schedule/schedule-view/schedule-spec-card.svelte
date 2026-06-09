<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DescribeFullSchedule } from '$lib/types/schedule';

  import { getFormSpecFromSpec } from '../utilities/get-form-spec';
  import { getScheduleSpecSummary } from '../utilities/summarize';

  interface Props {
    schedule: DescribeFullSchedule;
  }

  let { schedule }: Props = $props();

  let isFullSpecVisible = $state(false);

  const specs = $derived(getFormSpecFromSpec(schedule?.schedule?.spec));
  const timing = $derived({
    timezoneName: schedule?.schedule?.spec?.timezoneName ?? 'UTC',
  });
</script>

<Panel class="flex w-full flex-col gap-4 border-subtle p-6" as="section">
  <header class="mb-1 flex items-center justify-between">
    <h2 class="text-2xl font-medium">
      {translate('schedules.schedule-specs')}
    </h2>
    <Button
      variant="ghost"
      size="sm"
      trailingIcon="code"
      on:click={() => (isFullSpecVisible = !isFullSpecVisible)}
    >
      {isFullSpecVisible
        ? translate('schedules.hide-full-spec')
        : translate('schedules.view-full-spec')}
    </Button>
  </header>

  <p class="text-xs text-secondary">
    {translate('schedules.schedule-specs-description')}
  </p>

  <ul class="flex flex-col gap-4 text-sm">
    {#each specs as spec (spec)}
      <li>
        {getScheduleSpecSummary(spec, timing)}
      </li>
    {/each}
  </ul>

  {#if isFullSpecVisible}
    <CodeBlock
      maxHeight={300}
      language="json"
      content={JSON.stringify(schedule?.schedule?.spec, null, 2)}
    />
  {/if}
</Panel>
