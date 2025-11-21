<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowError } from '$lib/stores/workflows';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { TASK_FAILURES_QUERY } from '$lib/utilities/workflow-task-failures';
  import emptyImageDark from '$lib/vendor/empty-state-dark_2x.png';
  import emptyImageLight from '$lib/vendor/empty-state-light_2x.png';

  import NoWorkflowTaskFailures from './empty-states/no-workflow-task-failures.svelte';
  import NoWorkflows from './empty-states/no-workflows.svelte';

  interface Props {
    cloud?: Snippet;
  }

  let { cloud }: Props = $props();

  let query = $derived(page.url.searchParams.get('query'));

  let noResultsImages = $derived(
    $useDarkMode ? emptyImageDark : emptyImageLight,
  );
  let hasTaskFailuresQuery = $derived(query === TASK_FAILURES_QUERY);

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
  <link rel="preload" as="image" href={emptyImageDark} />
  <link rel="preload" as="image" href={emptyImageLight} />
</svelte:head>

{#if query}
  <div
    class="flex h-full w-full flex-col items-center justify-center p-4"
    aria-live="polite"
  >
    <div class="text-center">
      <h2>
        {#if $workflowError}
          {translate('workflows.workflow-query-error-state')}
        {:else}
          {hasTaskFailuresQuery
            ? translate(
                'workflows.workflow-task-failures-query-empty-state-title',
              )
            : translate('workflows.workflow-query-empty-state-title')}
        {/if}
      </h2>
      <p class="text-secondary">
        {#if $workflowError}
          {$workflowError}
        {:else}
          {hasTaskFailuresQuery
            ? translate(
                'workflows.workflow-task-failures-query-empty-state-description',
              )
            : translate('workflows.workflow-query-empty-state-description')}
        {/if}
      </p>
      {#if hasTaskFailuresQuery}
        <NoWorkflowTaskFailures class="m-auto mt-8 text-subtle" />
      {:else}
        <NoWorkflows class="m-auto mt-8 text-subtle" />
      {/if}
    </div>
  </div>
{:else}
  <div
    class="w-full overflow-hidden xl:flex xl:h-full xl:flex-row"
    aria-live="polite"
  >
    <div
      class="surface-primary flex w-auto min-w-[280px] flex-col gap-4 p-8 xl:min-w-[520px] xl:flex-1"
    >
      <h2>
        {translate('workflows.workflow-empty-state-title')}
      </h2>
      {#if $workflowError}
        <Alert
          intent="warning"
          icon="warning"
          title={translate('common.error-occurred')}
          style="overflow-wrap: anywhere"
        >
          {$workflowError}
        </Alert>
      {:else}
        {@render cloud?.()}
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
    </div>
    <div
      class="bg-[#DDD6FE] bg-contain bg-no-repeat xl:flex xl:h-full xl:max-w-[1050px] xl:flex-1 xl:items-stretch xl:justify-center"
      style="background-image: url({noResultsImages});"
    >
      <img
        src={noResultsImages}
        alt=""
        class="max-h-full max-w-full object-contain xl:hidden"
      />
    </div>
  </div>
{/if}
