<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';
  import type { SelectOptionValue } from '$lib/types/global';

  import NativeSelect from './native-select.svelte';
  import Option from './simple-option.svelte';

  export interface Props extends Omit<HTMLSelectAttributes, 'class'> {
    id: string;
    value: SelectOptionValue;
    label: string;
    name?: string;
    required?: boolean;
    options?: SelectOptionValue[];
    'data-testid'?: string;
    class?: ClassNameValue;
    inlinePadding?: string;
  }

  let {
    id,
    value = $bindable(),
    label,
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
  <NativeSelect
    wrapperClass="text-primary"
    class={merge(
      'inline h-10 w-full rounded border border-tertiary bg-background-primary py-0 text-base text-primary outline-hidden focus-visible:outline focus-visible:outline-interactive-primary disabled:bg-surface-tertiary',
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
  </NativeSelect>
</div>
