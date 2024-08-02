<script>
  import { page } from '$app/stores';

  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowError } from '$lib/stores/workflows';
  import emptyImage from '$lib/vendor/empty-state-dark_2x.png';
  import noResultsImages from '$lib/vendor/empty-state-light_2x.png';

  export let updating = false;

  $: query = $page.url.searchParams.get('query');

  const samples = [
    'samples-go',
    'samples-java',
    'samples-typescript',
    'samples-python',
    'samples-dotnet',
    'samples-php',
  ];
</script>

<svelte:head>
  <link rel="preload" as="image" href={emptyImage} />
</svelte:head>
<div
  class="flex h-auto w-full flex-col overflow-hidden xl:flex-row"
  aria-live="polite"
>
  <div
    class="surface-primary flex w-auto min-w-[280px] flex-col gap-4 border-b-2 border-table p-8 xl:min-w-[520px] xl:border-b-0 xl:border-r-2"
  >
    {#if updating}
      <Loading />
    {:else}
      <h2>
        {#if query}
          {translate('workflows.workflow-query-empty-state-title')}
        {:else}
          {translate('workflows.workflow-empty-state-title')}
        {/if}
      </h2>
      {#if $workflowError}
        <Alert
          intent="warning"
          icon="warning"
          title={translate('workflows.workflow-query-error-state')}
          style="overflow-wrap: anywhere"
        >
          {$workflowError}
        </Alert>
      {:else if query}
        <p>
          {translate('workflows.workflow-query-empty-state-preface')}
        </p>
        <p>
          {translate('workflows.workflow-query-empty-state-postface')}
        </p>
      {:else}
        <slot name="cloud" />
        <p>
          {translate('workflows.workflow-empty-state-description')}
          <Link newTab href="https://github.com/temporalio"
            >github.com/temporalio</Link
          >.
        </p>
        <ul class="flex flex-col gap-2">
          {#each samples as sample}
            <li>
              <Link
                icon="github"
                newTab
                href="https://github.com/temporalio/{sample}">{sample}</Link
              >
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
  <div class="bg-[#DDD6FE]">
    <img
      src={query ? noResultsImages : emptyImage}
      alt=""
      class="aspect-auto"
    />
  </div>
</div>
