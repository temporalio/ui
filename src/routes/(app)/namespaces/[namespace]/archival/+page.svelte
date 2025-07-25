<script lang="ts">
  import { page } from '$app/state';

  import type { PageData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  import ArchivalTable from './_archival-table.svelte';

  let { data }: { data: PageData } = $props();

  const {
    namespace: {
      namespaceInfo: { name: namespaceName },
    },
    archivalEnabled,
    visibilityArchivalEnabled,
    archivalQueryingSupported,
  } = $derived(data);
</script>

<PageTitle
  title={`${translate('workflows.archival')} | ${namespaceName}`}
  url={page.url.href}
/>
{#if archivalEnabled && visibilityArchivalEnabled}
  <h1 data-testid="archived-enabled-title">
    {translate('workflows.archived-workflows')}
  </h1>
  {#if archivalQueryingSupported}
    <Link newTab href="https://docs.temporal.io/list-filter"
      >List Filter Documentation</Link
    >
  {/if}
  <WorkflowAdvancedSearch />
  <ArchivalTable />
{:else if archivalEnabled}
  <h1 data-testid="visibility-disabled-title">
    {translate('workflows.visibility-disabled-archival')}
  </h1>
  <p>
    {translate('workflows.archival-link-preface')}<a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/clusters#archival"
      target="_blank"
      rel="noreferrer">{translate('workflows.archival-link')}</a
    >:
  </p>
  <CodeBlock
    content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
    language="text"
    inline
    copyIconTitle={translate('common.copy-icon-title')}
    copySuccessIconTitle={translate('common.copy-success-icon-title')}
  />
{:else}
  <h1 data-testid="archived-disabled-title">
    {translate('workflows.archival-disabled-title')}
  </h1>
  <p>{translate('workflows.archival-disabled-details')}:</p>
  <CodeBlock
    content={`temporal operator namespace update --history-archival-state enabled ${namespaceName}`}
    language="text"
    inline
    copyIconTitle={translate('common.copy-icon-title')}
    copySuccessIconTitle={translate('common.copy-success-icon-title')}
  />
  {#if !visibilityArchivalEnabled}
    <p>
      {translate('workflows.archival-link-preface')}<a
        class="text-blue-700 underline"
        href="https://docs.temporal.io/clusters#archival"
        target="_blank"
        rel="noreferrer">{translate('workflows.archival-link')}</a
      >:
    </p>
    <CodeBlock
      content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
      language="text"
      inline
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    />
  {/if}
{/if}
