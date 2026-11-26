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
    'absolute left-0 right-0 z-[5]',
    subtle
      ? 'h-0.5 overflow-x-clip bg-transparent'
      : 'h-1.5 overflow-hidden rounded-lg bg-surface-tertiary',
    className,
  )}
>
  <span
    class={merge(
      'block h-full w-2/5',
      subtle ? 'comet' : 'rounded-lg bg-content-brand',
    )}
  ></span>
</div>

<style>
  span {
    animation: move 1.5s linear infinite;
  }

  .comet {
    --comet: var(--color-content-brand);

    position: relative;
    border-radius: 0 2px 2px 0;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--comet) 2%, transparent) 20%,
      color-mix(in srgb, var(--comet) 13%, transparent) 40%,
      color-mix(in srgb, var(--comet) 36%, transparent) 60%,
      color-mix(in srgb, var(--comet) 75%, transparent) 80%,
      var(--comet) 90%,
      color-mix(in srgb, var(--comet), var(--color-content-white) 40%)
    );
    animation: comet-move 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  .comet::before,
  .comet::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .comet::before {
    right: 0;
    width: 22%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 0 0 10px 1px color-mix(in srgb, var(--comet) 55%, transparent);
  }

  .comet::after {
    right: -1px;
    width: 7px;
    height: 3px;
    border-radius: 9999px;
    background: var(--comet);
    box-shadow: 0 0 6px 2px color-mix(in srgb, var(--comet) 80%, transparent);
  }

  :global([data-theme='dark']) .comet::after {
    background: var(--color-content-white);
  }

  @keyframes move {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(350%);
    }
  }

  @keyframes comet-move {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(250%);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.25;
    }

    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    span,
    .comet {
      width: 100%;
      animation: pulse 2.4s ease-in-out infinite;
    }

    .comet {
      background: var(--comet);
    }

    .comet::before {
      width: 100%;
    }

    .comet::after {
      display: none;
    }
  }
</style>
