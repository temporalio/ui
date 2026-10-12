<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';

  import {
    type CatalogFacets,
    type CatalogFilterKey,
    type CatalogFilters,
    catalogFilterTitles,
  } from './catalog-list-state';

  import CatalogFacetOption from './catalog-facet-option.svelte';

  interface Props {
    open: boolean;
    facets: CatalogFacets;
    filters: CatalogFilters;
    onselect: (key: CatalogFilterKey, value: string | null) => void;
    onclear: () => void;
  }

  let {
    open = $bindable(),
    facets,
    filters,
    onselect,
    onclear,
  }: Props = $props();

  const drawerKeys: readonly CatalogFilterKey[] = ['feature', 'source'];
  const resultCount = $derived(facets.descriptors.length);
</script>

<Drawer
  bind:open
  id="catalog-filters"
  position="bottom"
  dark={false}
  closeButtonLabel="Close filters"
  onClick={() => (open = false)}
  class="max-h-[82vh] md:hidden"
>
  <DrawerContent title="Filters" class="flex flex-col gap-5">
    {#each drawerKeys as key (key)}
      <fieldset class="flex min-w-0 flex-col" data-facet={key}>
        <legend
          class="mb-1.5 text-xs font-medium uppercase tracking-wider text-secondary"
        >
          {catalogFilterTitles[key]}
        </legend>
        <div class="flex flex-wrap gap-1.5">
          {#each facets.options[key] as option (option.id)}
            <CatalogFacetOption
              {option}
              variant="chip"
              pressed={filters[key] === option.id}
              onclick={() => onselect(key, option.id)}
            />
          {/each}
        </div>
      </fieldset>
    {/each}
    <div class="flex gap-2">
      <Button variant="secondary" class="flex-1" onclick={onclear}>Clear</Button
      >
      <Button class="flex-1" onclick={() => (open = false)}>
        Show {resultCount === 1 ? '1 example' : `${resultCount} examples`}
      </Button>
    </div>
  </DrawerContent>
</Drawer>
