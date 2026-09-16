<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  let { class: className = '' }: { class?: string } = $props();
</script>

<div
  class={merge(
    'background-animate w-full rounded-full bg-gradient-to-r from-border-primary via-border-secondary to-border-tertiary',
    className,
  )}
></div>

<style lang="postcss">
  .background-animate {
    background-size: 400%;
    animation: Loading 3s ease infinite;
  }

  @keyframes Loading {
    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }
</style>
