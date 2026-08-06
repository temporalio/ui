<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { routeForWorkflowCatalog } from '$lib/utilities/route-for';
  import WorkflowCatalogDetail from '$lib/workflow-catalog/browser/catalog-detail.svelte';

  import {
    findRouteWorkflowDescriptor,
    routeWorkflowCatalog,
  } from '../catalog';
  import { getWorkflowCatalogContext } from '../context';

  const context = getWorkflowCatalogContext();
  const exampleId = $derived(page.params.exampleId);
  const descriptor = $derived(
    findRouteWorkflowDescriptor(routeWorkflowCatalog, exampleId),
  );
</script>

{#if descriptor}
  <PageTitle title={`${descriptor.title} | Workflow catalog`} />

  <header class="mb-6">
    <Link href={routeForWorkflowCatalog()} leadingIcon="chevron-left">
      Back to workflow catalog
    </Link>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <h1>{descriptor.title}</h1>
      <Badge type={descriptor.source === 'local' ? 'warning' : 'subtle'}>
        {descriptor.source === 'local' ? 'Local' : 'Shared'}
      </Badge>
    </div>
    <p class="mt-1 max-w-3xl text-sm text-secondary">
      {descriptor.description}
    </p>
  </header>

  <WorkflowCatalogDetail
    {descriptor}
    host={context.host}
    sessionStore={context.sessionStore}
  />
{:else}
  <PageTitle title="Workflow example not found" />

  <section
    class="max-w-2xl space-y-4"
    aria-labelledby="workflow-example-not-found"
  >
    <h1 id="workflow-example-not-found">Workflow example not found</h1>
    <p class="text-secondary">
      No workflow catalog example matches <code>{exampleId}</code>.
    </p>
    <a class="text-primary underline" href={routeForWorkflowCatalog()}>
      Back to workflow catalog
    </a>
  </section>
{/if}
