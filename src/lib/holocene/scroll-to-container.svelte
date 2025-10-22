<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import ScrollToBottom from '$lib/holocene/scroll-to-bottom.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import { navOpen } from '$lib/stores/nav-open';

  interface Props {
    scrollToTopHidden?: boolean;
    scrollToBottomHidden?: boolean;
    onScrollToTopClick: () => void;
    onScrollToBottomClick: () => void;
    scrollToTopAriaLabel: string;
    scrollToBottomAriaLabel: string;
    class?: ClassNameValue;
  }

  let {
    scrollToTopHidden = true,
    scrollToBottomHidden = false,
    class: className = '',
    onScrollToTopClick,
    onScrollToBottomClick,
    scrollToTopAriaLabel,
    scrollToBottomAriaLabel,
  }: Props = $props();
</script>

<div
  id="scroll-container"
  class={twMerge(
    'fixed bottom-5 z-50 hidden w-auto gap-2 transition-all md:flex',
    $navOpen ? 'left-[196px]' : 'left-20',
    className,
  )}
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
