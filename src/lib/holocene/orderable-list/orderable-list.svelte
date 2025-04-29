<script lang="ts">
  import OrderableListItem from './orderable-list-item.svelte';
</script>

<div class="orderable-section flex flex-col gap-1">
  <h5>
    <slot name="heading">Items</slot>
  </h5>
  <ol class="orderable-list surface-primary border-subtle border">
    <slot>
      <OrderableListItem readonly label="No Items" pinned={false} />
    </slot>
  </ol>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  /* Orderable list styles moved to inline */
</style>
