<script lang="ts">
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';

  let scrollToTopHidden = true;
  let showScrollToTopOn = 150; // pixels

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('content');
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

<main
  id="content"
  class="relative h-screen w-max flex-auto overflow-auto bg-gray-100"
  on:scroll={handleOnScroll}
>
  <slot />
  <ScrollToTop hidden={scrollToTopHidden} {onScrollToTopClick} />
</main>
