<script lang="ts">
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';

  let scrollToTopHidden = true;
  let showScrollToTopOn = 150; // pixels

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('content-wrapper');
  }

  function onScrollToTopClick() {
    getScrollContainer()?.scrollTo(0, 0);
  }

  function handleOnScroll(event: Event) {
    const scrollEvent = event.target as HTMLDivElement;
    const top = scrollEvent.scrollTop;
    scrollToTopHidden = Boolean(top < showScrollToTopOn);
  }
</script>

<div id="content-wrapper" class="main-content" on:scroll={handleOnScroll}>
  <slot />
  <main id="content">
    <slot name="main" />
  </main>
  <ScrollToTop hidden={scrollToTopHidden} {onScrollToTopClick} />
</div>

<style lang="postcss">
  .main-content {
    @apply relative h-screen w-max flex-auto overflow-auto bg-gray-100 dark:bg-primary dark:text-white;
  }
</style>
