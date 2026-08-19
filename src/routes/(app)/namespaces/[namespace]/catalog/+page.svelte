<script lang="ts">
  import { page } from '$app/state';

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
/>
