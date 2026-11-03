<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import PageHeader from '$lib/io/layouts/page-header/page-header.svelte';
  import {
    routeForWorkflow,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const workflow = $derived(page.params.workflow);
  const run = $derived(page.params.run);
</script>

<PageTitle title={translate('workflows.execution-chain')} url={page.url.href} />

<div class="flex h-full min-w-0 flex-col bg-background-primary text-primary">
  <PageHeader>
    {#snippet heading()}
      {translate('workflows.execution-chain')}
    {/snippet}
    {#snippet actions()}
      <Link href={routeForWorkflows({ namespace })}>
        {translate('workflows.execution-chain-back')}
      </Link>
      <Link href={routeForWorkflow({ namespace, workflow, run })}>
        {translate('workflows.execution-chain-view-execution')}
      </Link>
    {/snippet}
    {#snippet metadata()}
      <dl class="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-xs">
        <div class="min-w-0">
          <dt class="text-secondary">{translate('common.workflow-id')}</dt>
          <dd class="break-all font-mono">{workflow}</dd>
        </div>
        <div class="min-w-0">
          <dt class="text-secondary">{translate('common.run-id')}</dt>
          <dd class="break-all font-mono">{run}</dd>
        </div>
      </dl>
    {/snippet}
  </PageHeader>
  <section
    class="mx-page-margin mb-6 flex flex-1 items-center justify-center rounded border border-secondary p-8"
    aria-label={translate('workflows.execution-chain')}
    data-testid="workflow-chain"
  >
    <p class="text-secondary">
      {translate('workflows.execution-chain-placeholder')}
    </p>
  </section>
</div>
