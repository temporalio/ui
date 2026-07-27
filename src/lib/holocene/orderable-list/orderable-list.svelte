<script lang="ts">
  import OrderableListItem from './orderable-list-item.svelte';
</script>

<div class="orderable-section">
  <h5>
    <slot name="heading">Items</slot>
  </h5>
  <ol class="orderable-list">
    <slot>
      <OrderableListItem readonly label="No Items" />
    </slot>
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
