<script lang="ts">
  import type { NamespaceListItem } from '$lib/types/global';

  export let open = false;
  export let namespaceList: NamespaceListItem[] = [];
</script>

{#if open}
  <div class="flex h-full flex-col items-center gap-4 py-8">
    {#each namespaceList as { namespace, onClick }}
      <button
        on:click|preventDefault|stopPropagation={() => onClick(namespace)}
      >
        {namespace}
      </button>
    {/each}
  </div>
{/if}
