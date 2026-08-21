<script lang="ts">
  import { page } from '$app/state';

  import CatalogDetail from '$lib/catalog/browser/catalog-detail.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { IconChevronLeft } from '$lib/io/icon';
  import { coreUserStore } from '$lib/stores/core-user';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForCatalog } from '$lib/utilities/route-for';

  import {
    findRouteCatalogDescriptor,
    resolveCatalogForNamespace,
  } from '../catalog';
  import { getCatalogServices } from '../services';

  const coreUser = coreUserStore();
  const identity = getIdentity();
  const namespace = $derived(page.params.namespace);
  const exampleId = $derived(page.params.exampleId);
  const descriptor = $derived(
    findRouteCatalogDescriptor(
      resolveCatalogForNamespace(namespace),
      exampleId,
    ),
  );
  const services = $derived(
    getCatalogServices({
      namespace,
      getIdentity: () => identity,
      namespaceWriteDisabled: (candidate) =>
        $coreUser.namespaceWriteDisabled(candidate),
    }),
  );
</script>

{#if descriptor}
  <PageTitle title={`${descriptor.title} | Catalog`} />

  <header class="mb-6">
    <Link href={routeForCatalog({ namespace })} LeadingIcon={IconChevronLeft}>
      Back to catalog
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

  <CatalogDetail
    {descriptor}
    host={services.host}
    sessionStore={services.sessionStore}
  />
{:else}
  <PageTitle title="Catalog example not found" />

  <section
    class="max-w-2xl space-y-4"
    aria-labelledby="catalog-example-not-found"
  >
    <h1 id="catalog-example-not-found">Catalog example not found</h1>
    <p class="text-secondary">
      No catalog example matches <code>{exampleId}</code>.
    </p>
    <a class="text-primary underline" href={routeForCatalog({ namespace })}>
      Back to catalog
    </a>
  </section>
{/if}
