<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

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
  <h2 class="text-2xl" data-testid="namespace-select-header">
    Select a Namespace
  </h2>
  {#if $page.params?.namespace}
    <p>You are currently viewing {$page.params.namespace}</p>
  {/if}
</div>

<div class="mb-5 flex rounded-md border border-gray-900 p-1 pr-4">
  <div class="ml-4 mr-2">
    <Icon name="search" />
  </div>
  <input
    class="w-full"
    placeholder="Search"
    use:rootDocumentHandler
    on:keydown|stopPropagation
    bind:value={searchValue}
    bind:this={searchField}
  />
</div>

<ul data-testid="namespace-list">
  {#await namespaceList}
    Loading ...
  {:then namespacesResult}
    {#if namespacesResult}
      {#each namespacesResult.filter( ({ namespace }) => namespace.includes(searchValue), ) as namespace}
        <li
          class="first:rounded-t-xl first:border-t-3 last:rounded-b-xl last:border-b-3 border-b border-l-3 border-r-3 border-gray-900 flex border-collapse gap-2 hover:bg-gradient-to-br from-blue-100 to-purple-100 cursor-pointer"
        >
          <a
            href={namespace.href(namespace.namespace)}
            class="w-full flex p-3"
            class:active={namespace.namespace === $page.params?.namespace}
          >
            <div class="w-6 h-6 active">
              {#if namespace.namespace === $page.params?.namespace}
                <Icon name="checkmark" />
              {/if}
            </div>
            <p class="link">{namespace.namespace}</p>
          </a>
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
</style>
