<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$holocene/icon/icon.svelte';

  import { onMount } from 'svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { createEventDispatcher } from 'svelte';

  export let getNamespaceList: () => Promise<NamespaceItem[]> = null;

  let namespaceList = null;
  let searchField: HTMLInputElement = null;

  onMount(() => {
    namespaceList = getNamespaceList();
    searchField.focus();
  });
  const dispatch = createEventDispatcher();

  /** When a user presses escape close the namespace switcher  */
  export function rootDocumentHandler(node: Element): { destroy: () => void } {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (node && !event.defaultPrevented) {
        if (event.key === 'Escape') {
          dispatch('closeNamespaceList');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return {
      destroy() {
        document.removeEventListener('keydown', handleKeyDown, true);
      },
    };
  }

  $: searchValue = '';
</script>

<div class="prose mt-16 mb-8">
  <h2 class="text-2xl">Select a namespace</h2>
  {#if $page.params?.namespace}
    <p>You are currently viewing {$page.params.namespace}</p>
  {/if}
</div>

<div class="mb-5 flex rounded-full border p-1 pr-4">
  <div class="ml-4 mr-2">
    <Icon name="search" scale={1} />
  </div>
  <input
    class="w-full"
    placeholder="Search"
    use:rootDocumentHandler
    bind:value={searchValue}
    bind:this={searchField}
  />
</div>

<ul data-cy="namespace-list">
  {#await namespaceList}
    Loading ...
  {:then namespacesResult}
    {#if namespacesResult}
      {#each namespacesResult.filter( ({ namespace }) => namespace.includes(searchValue), ) as namespace}
        <li
          class="first:rounded-t-md first:border-t last:rounded-b-md border-b border-l border-r p-3 flex border-collapse gap-2 hover:bg-gray-50 cursor-pointer"
          on:click={() => namespace?.onClick()}
        >
          <div class="w-6 h-6 pl-3 active">
            {#if namespace.namespace === $page.params?.namespace}
              <Icon stroke="currentcolor" name="checkMark" />
            {/if}
          </div>
          <a
            href={namespace.href}
            class="link"
            class:active={namespace.namespace === $page.params?.namespace}
            >{namespace.namespace}</a
          >
        </li>
      {:else}
        <EmptyState title="No Namespaces" />
      {/each}
    {:else}
      <EmptyState title="Could not list Namespaces" />
    {/if}
  {/await}
</ul>

<style lang="postcss">
  .link {
    @apply ml-2 truncate text-gray-900;
  }

  .link:hover {
    @apply underline;
  }
  .active {
    @apply text-blue-700;
  }
</style>
