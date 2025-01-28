<script lang="ts">
  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';

  interface Props extends ButtonWithoutHrefProps {
    hidden: boolean;
    onScrollToBottomClick: () => void;
  }

  let { hidden, onScrollToBottomClick, ...rest }: Props = $props();
</script>

<div class="jump-to-bottom relative" class:hidden>
  <Button
    size="xs"
    variant="primary"
    onclick={onScrollToBottomClick}
    leadingIcon="arrow-down"
    {...rest}
  />
</div>

<style lang="postcss">
  .hidden {
    @apply invisible;
  }
</style>
