<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  let { class: className = '' }: { class?: string } = $props();
</script>

<div
  class={merge(
    'background-animate w-full rounded-control bg-subtle',
    className,
  )}
></div>

<style lang="postcss">
  .background-animate {
    animation: skeleton-pulse 1.8s var(--ease-standard, ease-in-out) infinite;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 0.55;
    }

    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .background-animate {
      animation: none;
      opacity: 0.72;
    }
  }
</style>
