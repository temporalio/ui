<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import type { NamespaceListItem } from '$lib/types/global';

  export let open = false;
  export let namespaceList: NamespaceListItem[] = [];

  let search = '';

  $: namespaces = search
    ? namespaceList.filter(({ namespace }) => namespace.includes(search))
    : namespaceList;
</script>

{#if open}
  <div class="relative flex h-full flex-col items-center gap-4 py-8">
    <Input
      id="namespace-search"
      type="search"
      label="Namespace search"
      labelHidden
      placeholder="Search"
      class="sticky top-0 w-full"
      bind:value={search}
    />
    {#each namespaces as { namespace, onClick }}
      <button
        on:click|preventDefault|stopPropagation={() => onClick(namespace)}
      >
        {namespace}
      </button>
    {/each}
  </div>
{/if}
