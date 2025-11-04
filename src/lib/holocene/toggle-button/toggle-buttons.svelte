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

<div class={twMerge('flex', className)} {...rest}>
  {@render children()}
</div>
