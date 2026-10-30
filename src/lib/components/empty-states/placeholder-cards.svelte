<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();

  const outerCard = 'opacity-50 bg-surface-secondary dark:bg-surface-primary';
  const centerCard = 'bg-primary shadow-lg dark:bg-surface-secondary';
  const cards = [outerCard, centerCard, outerCard];
  const lines = ['w-full', 'w-3/5', 'w-full', 'w-3/5', 'w-full', 'w-3/5'];
</script>

<div
  class={twMerge(
    'hidden w-full max-w-6xl grid-cols-3 gap-9 md:grid',
    className,
  )}
  aria-hidden="true"
>
  {#each cards as opacity, card (card)}
    <div
      class={twMerge(
        'border-subtle flex flex-col gap-5 rounded-lg border p-7',
        'dark:border-surface-tertiary',
        opacity,
      )}
    >
      {#each lines as width, i (i)}
        <div
          class={twMerge(
            'h-4 rounded bg-surface-overlay-primary dark:bg-surface-tertiary',
            width,
          )}
        ></div>
      {/each}
    </div>
  {/each}
</div>
