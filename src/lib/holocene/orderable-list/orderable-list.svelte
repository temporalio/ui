<script lang="ts">
  import OrderableListItem from './orderable-list-item.svelte';
</script>

<div class="orderable-section">
  <h4 class="orderable-heading">
    <slot name="heading">Items</slot>
  </h4>
  <ol class="orderable-list">
    <slot>
      <OrderableListItem label="No Items" pinned={false} />
    </slot>
  </ol>
</div>

<style lang="postcss">
  .orderable-section {
    @apply flex flex-col gap-2;
  }

  .orderable-heading {
    @apply text-sm font-medium;
  }

  .orderable-list {
    @apply rounded-lg border-2 border-primary bg-white;
  }
</style>
