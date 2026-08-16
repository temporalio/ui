<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';
  import type { SelectOptionValue } from '$lib/types/global';

  import Option from './simple-option.svelte';

  export interface Props extends Omit<HTMLSelectAttributes, 'class'> {
    id: string;
    value: SelectOptionValue;
    label: string;
    arrow?: boolean;
    name?: string;
    required?: boolean;
    options?: SelectOptionValue[];
    'data-testid'?: string;
    class?: ClassNameValue;
  }

  let {
    id,
    value = $bindable(),
    label,
    arrow = false,
    name = id,
    required = false,
    options = [],
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<div>
  <Label {required} {label} hidden for={id} />
  <select
    class={merge(
      'surface-primary inline h-control w-full rounded-control border border-primary px-3 text-sm text-primary outline-none transition-colors duration-fast hover:border-interactive focus-visible:border-interactive focus-visible:ring-2 focus-visible:ring-primary',
      arrow && 'h-8 appearance-none py-1 pl-3 text-sm',
      className,
    )}
    {name}
    {id}
    bind:value
    {...rest}
  >
    {#if children}
      {@render children()}
    {:else}
      {#each options as option}
        <Option value={option} />
      {/each}
    {/if}
  </select>
</div>
