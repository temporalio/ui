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

<div
  id="scroll-container"
  class="fixed bottom-5 right-8 z-50 hidden w-auto gap-2 md:flex {$$props.class}"
>
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
  @reference "tailwindcss";

  /* Scroll container styles moved to inline */
</style>
