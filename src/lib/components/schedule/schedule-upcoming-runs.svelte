<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  import type { Timestamp } from '$types';

  export let futureRuns: Timestamp[] = [];
</script>

<Panel class="w-full">
  <h2 class="mb-4">{translate('schedules.upcoming-runs')}</h2>
  {#each futureRuns.slice(0, 5) as run}
    <div class="row">
      <p>
        {formatDate(run, $timeFormat, {
          relative: $relativeTime,
          relativeLabel: translate('common.from-now'),
        })}
      </p>
    </div>
  {:else}
    <EmptyState
      title={translate('schedules.upcoming-runs-empty-state-title')}
    />
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply my-1 inline-flex h-10 w-full justify-start border-b-2 border-subtle py-1;
  }
</style>
