<script
  lang="ts"
  generics="Value extends SelectOptionValue = SelectOptionValue"
>
  import type { HTMLSelectAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { IconChevronDown } from '$lib/io/icon';
  import type { SelectOptionValue } from '$lib/types/global';

  interface Props extends Omit<HTMLSelectAttributes, 'class' | 'value'> {
    value?: Value;
    class?: ClassNameValue;
    wrapperClass?: ClassNameValue;
    inlinePadding?: string;
  }

  let {
    value = $bindable(),
    class: className,
    wrapperClass,
    /** we need inlinePadding as a prop to make sure the dropdown icon is properly inset */
    inlinePadding = '0.75rem',
    children,
    ...rest
  }: Props = $props();

  const iconSize = '0.8rem';
</script>

<div
  class={twMerge('relative', wrapperClass)}
  style:--select-inline-padding={inlinePadding}
  style:--dropdown-icon-size={iconSize}
>
  <select
    class={twMerge('w-full appearance-none', className)}
    bind:value
    {...rest}
  >
    {@render children?.()}
  </select>
  <span
    class="pointer-events-none absolute inset-y-0 end-[var(--select-inline-padding)] flex items-center"
  >
    <IconChevronDown width={iconSize} height={iconSize} />
  </span>
</div>

<style>
  select {
    padding-inline: var(--select-inline-padding)
      calc(var(--select-inline-padding) + var(--dropdown-icon-size) + 0.5rem);
  }
</style>
