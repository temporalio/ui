<script>import { page } from '$app/stores';
import Icon from '$holocene/icon/icon.svelte';
import { onMount } from 'svelte';
import EmptyState from '../holocene/empty-state.svelte';
import { createEventDispatcher } from 'svelte';
export let getNamespaceList = null;
let namespaceList = null;
let searchField = null;
onMount(() => {
    namespaceList = getNamespaceList();
    searchField.focus();
});
const dispatch = createEventDispatcher();
/** When a user presses escape close the namespace switcher  */
export function rootDocumentHandler(node) {
    const handleKeyDown = (event) => {
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
    <Icon name="search" />
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
          on:click={() => namespace?.onClick(namespace.namespace)}
        >
          <div class="w-6 h-6 pl-3 active">
            {#if namespace.namespace === $page.params?.namespace}
              <Icon name="checkmark" />
            {/if}
          </div>
          <a
            href={namespace.href(namespace.namespace)}
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

<style>
  .link {

    margin-left: 0.5rem;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .link:hover {

    -webkit-text-decoration-line: underline;

            text-decoration-line: underline
}
  .active {

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}</style>
