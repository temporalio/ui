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
      class="sticky top-0 w-full bg-primary p-2"
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
  .namespace {
    @apply w-full cursor-pointer rounded border border-transparent text-left text-sm font-medium hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-inverse focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 dark:focus-visible:border-interactive;

    &.selected {
      @apply text-brand;
    }
  }
</style>
