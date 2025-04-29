<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';

  export let open = false;
  export let namespaceList: NamespaceListItem[] = [];

  let search = '';

  $: namespaces = (
    search
      ? namespaceList.filter(({ namespace }) => namespace.includes(search))
      : namespaceList
  ).sort((a, b) => a.namespace.localeCompare(b.namespace));
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
      class="bg-primary sticky top-0 w-full p-2"
      bind:value={search}
    />
    <ul class="flex w-full flex-col gap-4 overflow-auto p-4 pt-2">
      {#each namespaces as { namespace, onClick }}
        <li>
          <button
            class="namespace"
            class:selected={namespace === $lastUsedNamespace}
            on:click|preventDefault|stopPropagation={() => onClick(namespace)}
          >
            {namespace}
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";

  .namespace {
    @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-inverse focus-visible:ring-primary/70 dark:focus-visible:border-interactive w-full cursor-pointer border border-transparent text-left text-sm font-medium focus-visible:ring-2 focus-visible:outline-hidden;

    &.selected {
      @apply text-brand;
    }
  }
</style>
