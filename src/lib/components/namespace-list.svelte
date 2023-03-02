<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { createEventDispatcher } from 'svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';

  export let namespaceList: NamespaceItem[] = [];

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

<div class="h-[400px] w-[500px] overflow-auto py-4 px-12">
  <div class="prose my-4">
    <h2 class="text-2xl" data-cy="namespace-select-header">
      Select a Namespace
    </h2>
  </div>
  <div class="mb-4">
    <Input
      id="namespace-search"
      bind:value={searchValue}
      autoFocus
      icon="search"
      placeholder="Search"
    />
  </div>

  <ul data-cy="namespace-list">
    {#each namespaceList.filter( ({ namespace }) => namespace.includes(searchValue), ) as namespace}
      <li
        class="flex border-collapse cursor-pointer gap-2 border-b border-l-3 border-r-3 border-gray-900 bg-white from-blue-100 to-purple-100 first:rounded-t-xl first:border-t-3 last:rounded-b-xl last:border-b-3 hover:bg-gradient-to-br"
      >
        <a
          on:click={() => ($lastUsedNamespace = namespace.namespace)}
          href={namespace.href(namespace.namespace)}
          class="flex w-full p-3"
          class:active={namespace.namespace === $page.params?.namespace}
        >
          <div class="active h-6 w-6">
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
  </ul>
</div>

<style lang="postcss">
  .link {
    @apply ml-2 truncate text-gray-900;
  }

  .link:hover {
    @apply underline;
  }
</style>
