<script lang="ts">
  import { type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  interface Props {
    children?: Snippet;
    class?: ClassNameValue;
    options?: IntersectionObserverInit;
    onIntersect?: (entry: IntersectionObserverEntry) => void;
  }

  let {
    children,
    class: className,
    options = { threshold: 0.1, rootMargin: '50px' },
    onIntersect,
  }: Props = $props();

  let hasIntersected = $state(false);

  function observeIntersection() {
    return (element: HTMLElement) => {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasIntersected) {
          hasIntersected = true;
          onIntersect?.(entry);
        }
      }, options);

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    };
  }
</script>

<div class={merge(className)} {@attach observeIntersection()}>
  {#if hasIntersected && children}
    {@render children()}
  {/if}
</div>
