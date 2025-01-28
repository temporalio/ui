<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';
  import type { SelectOptionValue } from '$lib/types/global';

  import Option from './simple-option.svelte';

  interface Props extends HTMLSelectAttributes {
    id: string;
    value: SelectOptionValue;
    label: string;
    arrow?: boolean;
    name?: string;
    required?: boolean;
    options?: SelectOptionValue[];
    'data-testid'?: string;
    class?: string;
  }

  let {
    id,
    value = $bindable(),
    label,
    arrow = false,
    name = id,
    required = false,
    options = [],
    class: className = null,
    children,
    ...rest
  }: Props = $props();
</script>

<div>
  <Label {required} {label} hidden for={id} />
  <select
    class={merge('inline h-10 w-full border px-2 text-base', className)}
    class:remove={arrow}
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

<style lang="postcss">
  select {
    @apply border-secondary bg-transparent text-primary outline-none focus-visible:outline focus-visible:outline-blue-700;
  }

  .remove {
    @apply h-8 appearance-none py-1 pl-3 text-sm;
  }
</style>
