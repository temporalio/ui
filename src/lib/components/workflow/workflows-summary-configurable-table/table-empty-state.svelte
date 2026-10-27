<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import NoWorkflowTaskFailures from '$lib/components/empty-states/no-workflow-task-failures.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalWorkflow, IconWarning } from '$lib/io/icon';
  import { workflowError } from '$lib/stores/workflows';
  import { TASK_FAILURES_QUERY } from '$lib/utilities/workflow-task-failures';

  interface Props {
    cloud?: Snippet;
  }

  let { cloud }: Props = $props();

  let query = $derived(page.url.searchParams.get('query'));

  let hasTaskFailuresQuery = $derived(query === TASK_FAILURES_QUERY);

  const samples = [
    { sdk: 'Go', href: 'https://github.com/temporalio/samples-go' },
    { sdk: 'Java', href: 'https://github.com/temporalio/samples-java' },
    {
      sdk: 'TypeScript',
      href: 'https://github.com/temporalio/samples-typescript',
    },
    { sdk: 'Python', href: 'https://github.com/temporalio/samples-python' },
    { sdk: '.NET', href: 'https://github.com/temporalio/samples-dotnet' },
    { sdk: 'PHP', href: 'https://github.com/temporalio/samples-php' },
    { sdk: 'Ruby', href: 'https://github.com/temporalio/samples-ruby' },
    {
      sdk: 'Rust',
      href: 'https://github.com/temporalio/sdk-rust/tree/main/crates/sdk/examples',
    },
  ];
</script>

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
        <NoWorkflowTaskFailures class="m-auto mt-8 text-tertiary" />
      {:else}
        <NoQueryResults class="m-auto mt-8 text-tertiary" />
      {/if}
    </div>
  </div>
{:else}
  <ResourceEmptyState
    title={translate('workflows.workflow-empty-state-title')}
    Icon={IconTemporalWorkflow}
  >
    {#snippet description()}
      {#if !$workflowError}
        <p>
          {translate('workflows.workflow-empty-state-description')}
          <Link newTab href="https://github.com/temporalio"
            >github.com/temporalio</Link
          >.
        </p>
      {/if}
    {/snippet}
    {#if $workflowError}
      <Alert
        intent="warning"
        Icon={IconWarning}
        title={translate('common.error-occurred')}
        style="overflow-wrap: anywhere"
      >
        {$workflowError}
      </Alert>
    {:else}
      {@render cloud?.()}
      <SdkLinks links={samples} />
    {/if}
  </ResourceEmptyState>
{/if}
