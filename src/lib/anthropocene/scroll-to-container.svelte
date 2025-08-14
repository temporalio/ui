<script lang="ts">
  import ScrollToBottom from '$lib/anthropocene/scroll-to-bottom.svelte';
  import ScrollToTop from '$lib/anthropocene/scroll-to-top.svelte';
  import { fullEventHistory } from '$lib/stores/events';

  interface Props {
    class?: string;
    scrollToTopHidden?: boolean;
    scrollToBottomHidden?: boolean;
    onScrollToTopClick: () => void;
    onScrollToBottomClick: () => void;
    scrollToTopAriaLabel: string;
    scrollToBottomAriaLabel: string;
  }

  let {
    class: className,
    scrollToTopHidden = true,
    scrollToBottomHidden = false,
    onScrollToTopClick,
    onScrollToBottomClick,
    scrollToTopAriaLabel,
    scrollToBottomAriaLabel,
    ...restProps
  }: Props = $props();
</script>

<div id="scroll-container" class={className} {...restProps}>
  <ScrollToTop
    hidden={scrollToTopHidden}
    {onScrollToTopClick}
    aria-label={scrollToTopAriaLabel}
  />
  {#if $fullEventHistory.length}
    <ScrollToBottom
      hidden={scrollToBottomHidden}
      {onScrollToBottomClick}
      aria-label={scrollToBottomAriaLabel}
    />
  {/if}
</div>

<style lang="postcss">
  #scroll-container {
    @apply fixed bottom-5 right-8 z-50 hidden w-auto gap-2 md:flex;
  }
</style>
