<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  let className = '';
  export { className as class };
</script>

<div
  class={merge(
    'background-animate w-full rounded-full bg-linear-to-r from-slate-100 via-slate-200 to-slate-300 dark:bg-linear-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-800',
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
