<script lang="ts">
  import { page } from '$app/state';

  import { createFetchCatalogAuthoringHost } from '$lib/catalog/browser/catalog-authoring-host';
  import CatalogCreate from '$lib/catalog/browser/catalog-create.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import {
    routeForCatalog,
    routeForCatalogExample,
  } from '$lib/utilities/route-for';

  import '../catalog';

  const namespace = $derived(page.params.namespace);
  const host = createFetchCatalogAuthoringHost();
  const exampleHref = (exampleId: string) =>
    routeForCatalogExample({ namespace, exampleId });
</script>

<PageTitle title="Create Local example | Catalog" />

<header class="mb-6">
  <Link href={routeForCatalog({ namespace })} leadingIcon="chevron-left">
    Back to catalog
  </Link>
  <h1 class="mt-3">Create Local example</h1>
  <p class="mt-1 max-w-3xl text-sm text-secondary">
    Create and edit a git-ignored workflow example in
    <code>catalog.local</code>, then Save to verify it before running or
    promoting it.
  </p>
</header>

<CatalogCreate {host} {exampleHref} />
