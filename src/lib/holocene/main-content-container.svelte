<script context="module">
  import { writable } from 'svelte/store';

  export const scrollTop = writable(0);
</script>

<script lang="ts">
  import {
    clearActives,
    endIndex,
    indexPageSize,
    startIndex,
  } from '$lib/stores/active-events';
  import { filteredEventHistory } from '$lib/stores/events';

  import ScrollToContainer from './scroll-to-container.svelte';

  let scrollToTopHidden = true;
  let scrollToBottomHidden = false;
  let showScrollToTopOn = 150; // pixels

  function getScrollContainer(): HTMLElement | null {
    return document.getElementById('content-wrapper');
  }

  function onScrollToTopClick() {
    $startIndex = 0;
    $endIndex = indexPageSize;
    getScrollContainer()?.scrollTo(0, 0);
  }

  function onScrollToBottomClick() {
    const historyLength = $filteredEventHistory?.length;
    if (historyLength) {
      clearActives();
      $endIndex = historyLength;
      $startIndex = $endIndex - indexPageSize;
    }
    getScrollContainer()?.scrollTo(0, getScrollContainer()?.scrollHeight);
  }

  function handleOnScroll(event: Event) {
    const scrollEvent = event.target as HTMLDivElement;
    $scrollTop = scrollEvent.scrollTop;
    scrollToTopHidden = Boolean($scrollTop < showScrollToTopOn);
  }
</script>

<div
  id="content-wrapper"
  class="relative h-screen w-max flex-auto overflow-auto"
  on:scroll={handleOnScroll}
>
  <slot />
  <main id="content" class="pb-16 md:pb-0">
    <slot name="main" />
  </main>
  <slot name="footer" />
  <ScrollToContainer
    {scrollToTopHidden}
    {scrollToBottomHidden}
    {onScrollToTopClick}
    {onScrollToBottomClick}
    scrollToTopAriaLabel="Scroll to top"
    scrollToBottomAriaLabel="Scroll to bottom"
  />
</div>
