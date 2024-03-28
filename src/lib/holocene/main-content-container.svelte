<script lang="ts">
  import ScrollToContainer from './scroll-to-container.svelte';

  let scrollToTopHidden = true;
  let scrollToBottomHidden = false;
  let showScrollToTopOn = 150; // pixels

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('content-wrapper');
  }

  function onScrollToTopClick() {
    getScrollContainer()?.scrollTo(0, 0);
  }

  function onScrollToBottomClick() {
    getScrollContainer()?.scrollTo(0, getScrollContainer()?.scrollHeight);
  }

  function handleOnScroll(event: Event) {
    const scrollEvent = event.target as HTMLDivElement;
    const top = scrollEvent.scrollTop;
    scrollToTopHidden = Boolean(top < showScrollToTopOn);
  }
</script>

<div
  id="content-wrapper"
  class="surface-secondary relative h-screen w-max flex-auto overflow-auto"
  on:scroll={handleOnScroll}
>
  <slot />
  <main id="content">
    <slot name="main" />
  </main>
  <ScrollToContainer
    {scrollToTopHidden}
    {scrollToBottomHidden}
    {onScrollToTopClick}
    {onScrollToBottomClick}
  />
</div>
