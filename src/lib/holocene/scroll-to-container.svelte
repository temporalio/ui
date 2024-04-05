<script lang="ts">
  import ScrollToBottom from '$lib/holocene/scroll-to-bottom.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';

  export let scrollToTopHidden = true;
  export let scrollToBottomHidden = false;
  export let onScrollToTopClick: () => void;
  export let onScrollToBottomClick: () => void;
</script>

<div id="scroll-container" class={$$props.class}>
  <ScrollToTop hidden={scrollToTopHidden} {onScrollToTopClick} />
  <ScrollToBottom hidden={scrollToBottomHidden} {onScrollToBottomClick} />
</div>

<style lang="postcss">
  #scroll-container {
    @apply fixed bottom-5 right-8 z-50 flex w-auto gap-2;
  }
</style>
