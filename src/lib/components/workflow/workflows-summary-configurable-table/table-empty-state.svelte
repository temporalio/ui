<script>
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowError } from '$lib/stores/workflows';
  import emptyImage from '$lib/vendor/empty-state-dark_2x.png';
  import noResultsImages from '$lib/vendor/empty-state-light_2x.png';

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

<div
  class="flex flex-col lg:flex-row w-full h-auto rounded-bl-xl rounded-br-xl border-2 border-gray-900 overflow-hidden"
>
  <div
    class="w-auto min-w-[280px] lg:min-w-[520px] p-8 flex flex-col gap-4 bg-white border-r-2 border-gray-900"
  >
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
  </div>
  <div class="max-h-[680px]">
    <img
      src={query ? noResultsImages : emptyImage}
      alt="no results found"
      class="mx-auto my-auto min-h-[420px] h-full"
    />
  </div>
</div>
