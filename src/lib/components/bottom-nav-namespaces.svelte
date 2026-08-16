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
      class="sticky top-0 w-full bg-primary p-2"
      bind:value={search}
    />
    <ul class="flex w-full flex-col gap-1 overflow-auto p-4 pt-2">
      {#each namespaces as { namespace, onClick } (namespace)}
        <li>
          <button
            class="namespace"
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
    @apply relative min-h-8 w-full cursor-pointer rounded-control border border-transparent px-2 text-left text-sm font-medium transition-colors hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary;

    &.selected {
      @apply bg-interactive-secondary-active text-primary;

      &::before {
        position: absolute;
        inset-block: 0.25rem;
        left: 0;
        width: 0.125rem;
        content: '';

        @apply bg-interactive;
      }
    }
  }

  @media (pointer: coarse) {
    .namespace {
      @apply min-h-target;
    }
  }
</style>
