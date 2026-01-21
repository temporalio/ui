<script lang="ts">
  import { page } from '$app/state';

  import NoWorkflows from '$lib/components/workflow/workflows-summary-configurable-table/empty-states/no-workflows.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activityError } from '$lib/stores/activities';
  import noResultsImages from '$lib/vendor/empty-state.svg';

  let query = $derived(page.url.searchParams.get('query'));
</script>

{#if query}
  <div
    class="flex h-full w-full flex-col items-center justify-center p-4"
    aria-live="polite"
  >
    <div class="text-center">
      <h2>
        {#if $activityError}
          {translate('activities.activity-query-error-state')}
        {:else}
          {translate('activities.empty-state-title')}
        {/if}
      </h2>
      <p class="text-secondary">
        {#if $activityError}
          {$activityError}
        {:else}
          {translate('activities.empty-state-description')}
        {/if}
      </p>
      <NoWorkflows class="m-auto mt-8 text-subtle" />
    </div>
  </div>
{:else}
  <div
    class="h-full w-full overflow-hidden xl:flex xl:flex-row"
    aria-live="polite"
  >
    <div
      class="surface-primary flex w-auto min-w-[280px] flex-col gap-4 p-8 xl:min-w-[520px] xl:flex-1"
    >
      <h2>
        {translate('activities.empty-state-title')}
      </h2>
      {#if $activityError}
        <Alert
          intent="warning"
          icon="warning"
          title={translate('common.error-occurred')}
          style="overflow-wrap: anywhere"
        >
          {$activityError}
        </Alert>
      {:else}
        <p>
          {translate('activities.empty-state-description')}
        </p>
      {/if}
    </div>
    <div class="flex h-full flex-col">
      <div class="bg-off-white dark:bg-[#0f1725]">
        <img src={noResultsImages} alt="" class="w-full" />
      </div>
      <div class="flex-1 bg-[#818cf8]"></div>
    </div>
  </div>
{/if}
