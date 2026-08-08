<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForWorkflowCatalogExample } from '$lib/utilities/route-for';
  import WorkflowCatalogList from '$lib/workflow-catalog/browser/catalog-list.svelte';

  import { resolveWorkflowCatalogForNamespace } from './catalog';
  import { getWorkflowCatalogServices } from './services';

  const coreUser = coreUserStore();
  const identity = getIdentity();
  const namespace = $derived(page.params.namespace);
  const descriptors = $derived(resolveWorkflowCatalogForNamespace(namespace));
  const services = $derived(
    getWorkflowCatalogServices({
      namespace,
      getIdentity: () => identity,
      namespaceWriteDisabled: (candidate) =>
        $coreUser.namespaceWriteDisabled(candidate),
    }),
  );
</script>

<PageTitle title="Workflow catalog" />

<header class="mb-4">
  <h1>Workflow catalog</h1>
  <p class="mt-1 text-sm text-secondary">
    Browse and run workflow examples for local development.
  </p>
</header>

<WorkflowCatalogList
  {descriptors}
  host={services.host}
  sessionStore={services.sessionStore}
  exampleHref={(exampleId) =>
    routeForWorkflowCatalogExample({ namespace, exampleId })}
/>
