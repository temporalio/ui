<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import NoWorkflowTaskFailures from '$lib/components/empty-states/no-workflow-task-failures.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalWorkflow } from '$lib/io/icon';
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
      sdk: 'Typescript',
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
  <ResourceEmptyState
    title={$workflowError
      ? translate('workflows.workflow-query-error-state')
      : hasTaskFailuresQuery
        ? translate('workflows.workflow-task-failures-query-empty-state-title')
        : translate('workflows.workflow-query-empty-state-title')}
    content={hasTaskFailuresQuery
      ? translate(
          'workflows.workflow-task-failures-query-empty-state-description',
        )
      : translate('workflows.workflow-query-empty-state-description')}
    error={$workflowError}
  >
    {#snippet illustration()}
      {#if hasTaskFailuresQuery}
        <NoWorkflowTaskFailures class="text-tertiary" />
      {:else}
        <NoQueryResults class="text-tertiary" />
      {/if}
    {/snippet}
  </ResourceEmptyState>
{:else}
  <ResourceEmptyState
    title={translate('workflows.workflow-empty-state-title')}
    Icon={IconTemporalWorkflow}
    error={$workflowError}
    actions={cloud}
  >
    {#snippet description()}
      <p>
        {translate('workflows.workflow-empty-state-value-proposition')}
      </p>
      <p>
        {translate('workflows.workflow-empty-state-read-docs-prefix')}
        <Link href="https://docs.temporal.io/workflows" newTab>
          {translate('workflows.workflow-empty-state-docs-link')}
        </Link>
        {translate('workflows.workflow-empty-state-read-docs-suffix')}
      </p>
    {/snippet}
    {#snippet resources()}
      <SdkLinks
        links={samples}
        label={translate('workflows.workflow-empty-state-samples-title')}
      />
    {/snippet}
  </ResourceEmptyState>
{/if}
