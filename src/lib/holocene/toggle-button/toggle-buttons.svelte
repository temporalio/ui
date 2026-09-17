<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { setContext, type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  setContext<boolean>('group', true);

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: ClassNameValue;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
  class={twMerge(
    'flex [&>*>button:first-child]:rounded-none [&>:first-child>button:first-child]:rounded-l [&>:first-child]:rounded-l [&>:last-child>button:first-child]:rounded-r [&>:last-child]:rounded-r',
    className,
  )}
  {...rest}
>
  {@render children()}
</div>
