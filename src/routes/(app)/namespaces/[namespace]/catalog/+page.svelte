<script lang="ts">
  import { untrack } from 'svelte';

  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';

  import {
    type CatalogFilters,
    catalogFiltersFromSearchParams,
    catalogFiltersUrl,
  } from '$lib/catalog/browser/catalog-list-state';
  import CatalogList from '$lib/catalog/browser/catalog-list.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForCatalogExample } from '$lib/utilities/route-for';

  import { resolveCatalogForNamespace } from './catalog';
  import { getCatalogServices } from './services';

  const coreUser = coreUserStore();
  const identity = getIdentity();
  const namespace = $derived(page.params.namespace);
  const descriptors = $derived(resolveCatalogForNamespace(namespace));
  const services = $derived(
    getCatalogServices({
      namespace,
      getIdentity: () => identity,
      namespaceWriteDisabled: (candidate) =>
        $coreUser.namespaceWriteDisabled(candidate),
    }),
  );
  const initialFilters = untrack(() =>
    catalogFiltersFromSearchParams(page.url.searchParams),
  );

  const syncFiltersToUrl = (filters: CatalogFilters) => {
    const url = catalogFiltersUrl(page.url, filters);
    if (url.search === page.url.search) return;
    replaceState(url, page.state);
  };
</script>

<PageTitle title="Catalog" />

<header class="mb-4">
  <h1>Catalog</h1>
  <p class="mt-1 text-sm text-secondary">
    Browse and run catalog examples for local development.
  </p>
</header>

<CatalogList
  {descriptors}
  host={services.host}
  sessionStore={services.sessionStore}
  exampleHref={(exampleId) => routeForCatalogExample({ namespace, exampleId })}
  {initialFilters}
  onfilterschange={syncFiltersToUrl}
/>
