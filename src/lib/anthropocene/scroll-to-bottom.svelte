<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/anthropocene/button.svelte';

  interface Props extends ComponentProps<Button> {
    hidden: boolean;
    onScrollToBottomClick: () => void;
  }

  let { hidden, onScrollToBottomClick, ...restProps }: Props = $props();
</script>

<div class="jump-to-bottom relative" class:hidden>
  <Button
    size="xs"
    variant="primary"
    onclick={onScrollToBottomClick}
    leadingIcon="arrow-down"
    {...restProps}
  />
</div>

<style lang="postcss">
  .hidden {
    @apply invisible;
  }
</style>
