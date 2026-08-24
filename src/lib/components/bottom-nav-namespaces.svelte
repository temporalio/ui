<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import { sortAlphabetically } from '$lib/utilities/sort-alphabetically';

  interface Props {
    open?: boolean;
    namespaceList?: NamespaceListItem[];
  }

  let { open = false, namespaceList = [] }: Props = $props();

  let search = $state('');

  const namespaces = $derived(
    sortAlphabetically(
      search
        ? namespaceList.filter(({ namespace }) => namespace.includes(search))
        : namespaceList,
      (ns) => ns.namespace,
    ),
  );
</script>

{#if open}
  <div data-testid="namespace-search-list">
    <Input
      id="namespace-search"
      type="search"
      label="Namespace search"
      labelHidden
      autoFocus
      placeholder="Search"
      class="sticky top-0 w-full bg-surface-primary p-2"
      bind:value={search}
    />
    <ul class="flex w-full flex-col gap-4 overflow-auto p-4 pt-2">
      {#each namespaces as { namespace, onClick } (namespace)}
        <li>
          <button
            class="namespace dark:focus-visible:border-brand"
            class:selected={namespace === $lastUsedNamespace}
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(namespace);
            }}
          >
            {namespace}
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style lang="postcss">
  .namespace {
    @apply w-full cursor-pointer border border-transparent text-left text-sm font-medium hover:bg-interactive-secondary hover:text-primary focus-visible:border-slate-1 focus-visible:bg-interactive-secondary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary;

    &.selected {
      @apply text-brand;
    }
  }
</style>
