<script lang="ts">
  import { page } from '$app/stores';

  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import {
    categories,
    componentRegistry,
  } from '$lib/holocene/fairytale-registry';
  import Input from '$lib/holocene/input/input.svelte';
  import VerticalNavItem from '$lib/holocene/vertical-nav/vertical-nav-item.svelte';
  import VerticalNav from '$lib/holocene/vertical-nav/vertical-nav.svelte';
  import DarkMode from '$lib/utilities/dark-mode';

  let { children } = $props();

  let search = $state('');

  const componentEntries = $derived(
    Object.entries(componentRegistry)
      .filter(([key, entry]) => key !== 'index' && !entry.requiresContext)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

  const filteredByCategory = $derived.by(() => {
    const filtered = search
      ? componentEntries.filter(([key]) =>
          key.toLowerCase().includes(search.toLowerCase()),
        )
      : componentEntries;

    const grouped: Record<
      string,
      [string, (typeof componentRegistry)[string]][]
    > = {};
    for (const entry of filtered) {
      const cat = entry[1].category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(entry);
    }
    return grouped;
  });

  const currentComponent = $derived($page.params.component);
</script>

<PageTitle title="Fairytale" />
<DarkMode />
<div class="surface-primary flex h-screen">
  <aside
    class="surface-secondary flex w-72 shrink-0 flex-col border-r border-subtle"
  >
    <div class="border-b border-subtle p-4">
      <div class="flex items-center justify-between">
        <a href="/fairytale" class="text-lg font-bold text-primary">
          fairytale
        </a>
        <DarkModeMenu />
      </div>
      <p class="mt-1 text-xs text-secondary">
        {componentEntries.length} components
      </p>
      <Input
        id="fairytale-search"
        bind:value={search}
        label="Search"
        labelHidden
        placeholder="Search components..."
        icon="search"
        clearable
        clearButtonLabel="Clear search"
        class="mt-3"
      />
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      {#each categories as category (category)}
        {@const items = filteredByCategory[category]}
        {#if items && items.length > 0}
          <div class="mb-3">
            <h3
              class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-secondary"
            >
              {category}
            </h3>
            <VerticalNav
              aria-label="{category} components"
              activeItemId={currentComponent}
            >
              {#each items as [key] (key)}
                <VerticalNavItem id={key} label={key} href="/fairytale/{key}" />
              {/each}
            </VerticalNav>
          </div>
        {/if}
      {/each}
    </div>
  </aside>

  <main class="surface-primary flex-1 overflow-y-auto">
    {@render children()}
  </main>
</div>
