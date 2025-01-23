<script lang="ts">
  import type { Snippet } from 'svelte';

  import OrderableListItem from './orderable-list-item.svelte';

  interface Props {
    heading?: Snippet;
    children?: Snippet;
  }

  let { heading, children }: Props = $props();
</script>

<div class="orderable-section">
  <h5>
    {#if heading}{@render heading()}{:else}Items{/if}
  </h5>
  <ol class="orderable-list">
    {#if children}{@render children()}{:else}
      <OrderableListItem readonly label="No Items" />
    {/if}
  </ol>
</div>

<style lang="postcss">
  .orderable-section {
    @apply flex flex-col gap-1;
  }

  .orderable-list {
    @apply surface-primary border border-subtle;
  }
</style>
