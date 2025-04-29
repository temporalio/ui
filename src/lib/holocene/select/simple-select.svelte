<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';
  import type { SelectOptionValue } from '$lib/types/global';

  import Option from './simple-option.svelte';

  interface $$Props extends HTMLSelectAttributes {
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

  let className: string = null;
  export { className as class };
  export let id: string;
  export let value: SelectOptionValue;
  export let label: string;
  export let arrow = false;
  export let name = id;
  export let required = false;
  export let options: SelectOptionValue[] = [];
</script>

<div>
  <Label {required} {label} hidden for={id} />
  <select
    class={merge(
      'border-secondary text-primary dark:surface-primary outline-hidden inline h-10 w-full border bg-transparent px-2 text-base focus-visible:outline focus-visible:outline-blue-700',
      arrow ? 'h-8 appearance-none py-1 pl-3 text-sm' : '',
      className,
    )}
    class:remove={arrow}
    {name}
    {id}
    bind:value
    on:change
    {...$$restProps}
  >
    <slot>
      {#each options as option}
        <Option value={option} />
      {/each}
    </slot>
  </select>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  /* Select styles moved to inline */
</style>
