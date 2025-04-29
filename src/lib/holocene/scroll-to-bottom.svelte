<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let hidden: boolean;
  export let onScrollToBottomClick: () => void;
</script>

<div class="jump-to-bottom relative" class:hidden class:invisible={hidden}>
  <Button
    size="xs"
    variant="primary"
    on:click={onScrollToBottomClick}
    leadingIcon="arrow-down"
    {...$$restProps}
  />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  /* Hidden styles moved to inline */
</style>
