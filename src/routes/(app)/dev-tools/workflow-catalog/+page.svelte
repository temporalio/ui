<script lang="ts">
  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowCatalogList from '$lib/workflow-catalog/browser/catalog-list.svelte';

  import { routeWorkflowCatalog } from './catalog';
  import { getWorkflowCatalogContext } from './context';

  const context = getWorkflowCatalogContext();
</script>

<PageTitle title="Workflow catalog" />

<header class="mb-4">
  <h1>Workflow catalog</h1>
  <p class="mt-1 text-sm text-secondary">
    Browse and run workflow examples for local development.
  </p>
</header>

<WorkflowCatalogList
  descriptors={routeWorkflowCatalog}
  host={context.host}
  sessionStore={context.sessionStore}
/>
