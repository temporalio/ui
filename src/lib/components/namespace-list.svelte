<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  export let namespaceList: null | Promise<
    { namespace: string; href: string; onClick: () => void }[]
  >;
  export let activeNamespace: string | undefined | null;
  export let lastUsedNamespace: string | null;

  $: searchValue = '';
</script>

<div class="prose mt-16 mb-8">
  <h2 class="text-2xl">Select a namespace</h2>
  {#if activeNamespace}
    <p>You are currently viewing {activeNamespace}</p>
  {/if}
</div>

<div class="mb-5 flex rounded-full border p-1 pr-4">
  <div class="ml-4 mr-2">
    <Icon name="search" scale={1} />
  </div>
  <input class="w-full" placeholder="Search" bind:value={searchValue} />
</div>

<ul data-cy="namespace-list">
  {#await namespaceList}
    Loading ...
  {:then namespacesResult}
    {#if namespacesResult}
      {#each namespacesResult.filter( ({ namespace }) => namespace.includes(searchValue), ) as namespace}
        <li
          class="first:rounded-t-md first:border-t last:rounded-b-md border-b border-l border-r p-3 flex border-collapse gap-2 hover:bg-gray-50 cursor-pointer"
          on:click={() => {
            namespace.onClick();
            lastUsedNamespace = namespace.namespace;
          }}
        >
          <div class="w-6 h-6 pl-3 active">
            {#if namespace.namespace === activeNamespace}
              <Icon stroke="currentcolor" name="checkMark" />
            {/if}
          </div>
          <a
            href={namespace.href}
            class="link"
            class:active={activeNamespace === namespace.namespace}
            >{namespace.namespace}</a
          >
        </li>
      {/each}
    {:else}
      No Namespaces
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
