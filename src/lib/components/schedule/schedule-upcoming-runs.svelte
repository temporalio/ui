<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { Timestamp as ITimestamp } from '$types';

  export let futureRuns: ITimestamp[] = [];
</script>

<Panel class="w-full">
  <h2 class="mb-4">{translate('schedules.upcoming-runs')}</h2>
  {#each futureRuns.slice(0, 5) as run, index (index)}
    <div class="row">
      <Timestamp as="p" dateTime={run} />
    </div>
  {:else}
    <EmptyState
      title={translate('schedules.upcoming-runs-empty-state-title')}
    />
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply my-1 inline-flex h-10 w-full justify-start border-b border-subtle py-1;
  }
</style>
