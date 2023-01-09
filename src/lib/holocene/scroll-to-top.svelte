<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let showOn = 150; // pixels
  export let scrollToContainer = false;
  let hidden = true;

  function getScrollContainer(): HTMLElement | null {
    return scrollToContainer
      ? document.getElementById('scroll-container')
      : document.documentElement || document.body;
  }

  function scrollToTop() {
    getScrollContainer()?.scrollIntoView();
  }

  function handleOnScroll() {
    const scrollContainer = getScrollContainer();

    if (!scrollContainer) return;

    hidden = Boolean(scrollContainer.getBoundingClientRect().top + showOn > 0);
  }
</script>

<svelte:window on:scroll={handleOnScroll} />

<div id="scroll-container" class={$$props.class}>
  <slot />
  <div class="back-to-top" class:hidden>
    <Button
      class="!py-1.5 !px-1"
      icon="arrow-up"
      variant="secondary"
      on:click={scrollToTop}
    />
  </div>
</div>

<style lang="postcss">
  .back-to-top {
    @apply fixed right-5 bottom-5 z-50;
  }

  .back-to-top.hidden {
    @apply invisible;
  }
</style>
