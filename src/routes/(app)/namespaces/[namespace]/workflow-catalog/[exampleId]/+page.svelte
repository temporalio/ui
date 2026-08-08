<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForWorkflowCatalog } from '$lib/utilities/route-for';
  import WorkflowCatalogDetail from '$lib/workflow-catalog/browser/catalog-detail.svelte';

  import {
    findRouteWorkflowDescriptor,
    resolveWorkflowCatalogForNamespace,
  } from '../catalog';
  import { getWorkflowCatalogServices } from '../services';

  const coreUser = coreUserStore();
  const identity = getIdentity();
  const namespace = $derived(page.params.namespace);
  const exampleId = $derived(page.params.exampleId);
  const descriptor = $derived(
    findRouteWorkflowDescriptor(
      resolveWorkflowCatalogForNamespace(namespace),
      exampleId,
    ),
  );
  const services = $derived(
    getWorkflowCatalogServices({
      namespace,
      getIdentity: () => identity,
      namespaceWriteDisabled: (candidate) =>
        $coreUser.namespaceWriteDisabled(candidate),
    }),
  );
</script>

{#if descriptor}
  <PageTitle title={`${descriptor.title} | Workflow catalog`} />

  <header class="mb-6">
    <Link
      href={routeForWorkflowCatalog({ namespace })}
      leadingIcon="chevron-left"
    >
      Back to workflow catalog
    </Link>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <h1>{descriptor.title}</h1>
      <Badge type={descriptor.source.id === 'local' ? 'warning' : 'subtle'}>
        {descriptor.source.label}
      </Badge>
    </div>
    <p class="mt-1 max-w-3xl text-sm text-secondary">
      {descriptor.description}
    </p>
  </header>

  <WorkflowCatalogDetail
    {descriptor}
    host={services.host}
    sessionStore={services.sessionStore}
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
    <a
      class="text-primary underline"
      href={routeForWorkflowCatalog({ namespace })}
    >
      Back to workflow catalog
    </a>
  </section>
{/if}
