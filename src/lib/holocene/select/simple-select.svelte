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
      'inline h-10 w-full border border-io-border-tertiary bg-io-interactive-secondary px-2 text-base text-io-content-primary outline-none focus-visible:outline focus-visible:outline-io-interactive-primary',
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
