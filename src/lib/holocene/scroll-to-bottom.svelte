<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let scrollToContainer = false;

  let sticky = false;

  function getScrollContainer(): HTMLElement | null {
    return scrollToContainer
      ? document.getElementById('scroll-container')
      : document.documentElement || document.body;
  }

  function scrollToBottom() {
    handleStickyToBottom();
  }

  function handleStickyToBottom() {
    const scrollContainer = getScrollContainer();
    const bottom = scrollContainer.getBoundingClientRect().bottom;
    if (!scrollContainer) return;
    scrollContainer.scrollTo({ top: bottom });
  }
</script>

<div id="scroll-container" class={$$props.class}>
  <slot />
  <div class="back-to-bottom">
    <Button
      class="!py-1.5 !px-1"
      icon="chevron-down"
      variant="secondary"
      on:click={scrollToBottom}
    />
  </div>
</div>

<style lang="postcss">
  .back-to-bottom {
    @apply fixed right-16 bottom-5 z-50;
  }
</style>
