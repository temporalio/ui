<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  interface Props {
    subtle?: boolean;
    class?: string;
  }

  let { subtle = false, class: className = '' }: Props = $props();
</script>

<div
  class={merge(
    'absolute left-0 right-0 z-[5] overflow-hidden',
    subtle ? 'h-0.5 bg-transparent' : 'h-1.5 rounded-full bg-surface-tertiary',
    className,
  )}
>
  <span
    class={merge(
      'block h-full w-2/5 bg-content-brand',
      !subtle && 'rounded-full',
    )}
  ></span>
</div>

<style>
  span {
    animation: move 1.5s linear infinite;
  }

  @keyframes move {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(350%);
    }
  }
</style>
