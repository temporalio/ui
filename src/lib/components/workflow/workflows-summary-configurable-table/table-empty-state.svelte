<script>
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
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
  <link rel="preload" as="image" href={noResultsImages} />
</svelte:head>
<div
  class="flex flex-col xl:flex-row w-full h-auto overflow-hidden"
  aria-live="polite"
>
  <div
    class="w-auto min-w-[280px] xl:min-w-[520px] p-8 flex flex-col gap-4 bg-white border-b-2 xl:border-b-0 xl:border-r-2 border-gray-900"
  >
    {#if updating}
      <Loading />
    {:else}
      <h3 class="text-lg font-medium">
        {#if query}
          {translate('workflows', 'workflow-query-empty-state-title')}
        {:else}
          {translate('workflows', 'workflow-empty-state-title')}
        {/if}
      </h3>
      {#if $workflowError}
        <p>
          {translate('workflows', 'workflow-query-error-state')}
        </p>
        <p
          class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
        >
          {$workflowError}
        </p>
      {:else if query}
        <p>
          {translate('workflows', 'workflow-query-empty-state-preface')}
        </p>
        <p>
          {translate('workflows', 'workflow-query-empty-state-postface')}
        </p>
      {:else}
        <slot name="cloud" />
        <p>
          {translate('workflows', 'workflow-empty-state-description')}
          <a
            href="https://github.com/temporalio"
            rel="noreferrer"
            target="_blank"
            class="underline hover:text-blue-700 hover:decoration-blue-700"
            >Temporal's GitHub repository</a
          >.
        </p>
        <ul class="flex flex-col gap-2">
          {#each samples as sample}
            <li>
              <a
                class="flex gap-2 items-center hover:text-blue-700 hover:underline hover:decoration-blue-700"
                href="https://github.com/temporalio/{sample}"
                rel="noreferrer"
                target="_blank"><Icon name="github" />{sample}</a
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
