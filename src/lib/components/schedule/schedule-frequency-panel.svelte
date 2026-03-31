<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { ScheduleSpec } from '$types';

  interface Props {
    spec: ScheduleSpec;
  }

  let { spec }: Props = $props();

  const hasCronString = $derived(
    spec?.structuredCalendar?.length > 0 &&
      !!spec?.structuredCalendar[0].comment,
  );

  let viewFullSpec = $state(false);
</script>

<Panel>
  <div class="mb-4 flex items-center justify-between gap-4">
    <h2>
      {hasCronString
        ? translate('schedules.cron-string')
        : translate('schedules.schedule-spec')}
    </h2>
    <Button
      size="xs"
      variant="ghost"
      on:click={() => (viewFullSpec = !viewFullSpec)}
    >
      {viewFullSpec
        ? translate('schedules.hide-full-spec')
        : translate('schedules.view-full-spec')}
    </Button>
  </div>
  <ScheduleFrequency {spec} />
  {#if viewFullSpec}
    <CodeBlock language="json" content={JSON.stringify(spec, null, 2)} />
  {/if}
</Panel>
