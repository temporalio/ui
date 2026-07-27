<script lang="ts">
  import type { HTMLOptionAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import type { SelectOptionValue } from '$lib/types/global';

  interface Props extends Omit<HTMLOptionAttributes, 'class'> {
    value: SelectOptionValue;
    class?: ClassNameValue;
  }

  const { value, class: className, children, ...rest }: Props = $props();
</script>

<option {value} class={twMerge('border-0', className)} {...rest}>
  {#if children}
    {@render children()}
  {:else}
    {value}
  {/if}
</option>
