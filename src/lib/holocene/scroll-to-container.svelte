<script lang="ts">
  import ScrollToBottom from '$lib/holocene/scroll-to-bottom.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import { fullEventHistory } from '$lib/stores/events';

  interface Props {
    scrollToTopHidden?: boolean;
    scrollToBottomHidden?: boolean;
    onScrollToTopClick: () => void;
    onScrollToBottomClick: () => void;
    scrollToTopAriaLabel: string;
    scrollToBottomAriaLabel: string;
    class?: string;
  }

  let {
    scrollToTopHidden = true,
    scrollToBottomHidden = false,
    onScrollToTopClick,
    onScrollToBottomClick,
    scrollToTopAriaLabel,
    scrollToBottomAriaLabel,
    class: className = '',
  }: Props = $props();
</script>

<div id="scroll-container" class={className}>
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
