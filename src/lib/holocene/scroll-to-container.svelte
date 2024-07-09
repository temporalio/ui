<script lang="ts">
  import ScrollToBottom from '$lib/holocene/scroll-to-bottom.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import { fullEventHistory } from '$lib/stores/events';

  export let scrollToTopHidden = true;
  export let scrollToBottomHidden = false;
  export let onScrollToTopClick: () => void;
  export let onScrollToBottomClick: () => void;
  export let scrollToTopAriaLabel: string;
  export let scrollToBottomAriaLabel: string;
</script>

<div id="scroll-container" class={$$props.class}>
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
    @apply fixed bottom-16 right-2 z-50 flex w-auto gap-2 md:bottom-5 md:right-8;
  }
</style>
