<script lang="ts">
  import { untrack } from 'svelte';

  import Paginated from './paginated.svelte';

  let { initialItems }: { initialItems: number[] } = $props();

  let items = $state.raw(untrack(() => initialItems));

  export const swapItems = (next: number[]) => {
    items = next;
  };
</script>

<Paginated
  {items}
  perPageLabel="Per page"
  pageButtonLabel={(p: number) => `Page ${p}`}
  nextPageButtonLabel="Next"
  previousPageButtonLabel="Previous"
>
  {#snippet rows({ visibleItems })}
    {#each visibleItems as item (item)}
      <tr data-testid="row" data-item={item}>
        <td>{item}</td>
      </tr>
    {/each}
  {/snippet}
</Paginated>
