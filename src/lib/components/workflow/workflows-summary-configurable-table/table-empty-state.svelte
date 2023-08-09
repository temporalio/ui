<script>
  import { page } from '$app/stores';
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowError } from '$lib/stores/workflows';

  $: query = $page.url.searchParams.get('query');

  let links = [
    'samples-go',
    'samples-java',
    'samples-typescript',
    'samples-python',
    'samples-dotnet',
    'samples-php',
  ];
</script>

<div class="w-[280px] md:w-[500px] p-8 flex flex-col gap-4">
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
    <slot name="cloud-empty-state" />
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
      {#each links as link}
        <li>
          <a
            class="flex gap-2 items-center hover:text-blue-700 hover:underline hover:decoration-blue-700"
            href="https://github.com/temporalio/{link}"
            rel="noreferrer"
            target="_blank"><Icon name="github" />{link}</a
          >
        </li>
      {/each}
    </ul>
  {/if}
</div>
