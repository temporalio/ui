<script lang="ts" generics="T">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';

  import type { RadioGroupContext, RadioInputProps } from './types';

  import RadioControl from './radio-control.svelte';
  import { RADIO_GROUP_CONTEXT } from './radio-group.svelte';

  let {
    value,
    id,
    label,
    description = undefined,
    labelHidden = false,
    disabled = false,
    required = false,
    group: internalGroup = writable(value),
    name: internalName = '',
    class: className = undefined,
    ...rest
  }: RadioInputProps<T> = $props();

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    get name() {
      return internalName;
    },
    get group() {
      return internalGroup;
    },
  };

  const { name, group } = ctx;
</script>

<div>
  <div class="flex items-center">
    <Label
      {disabled}
      required={required ?? false}
      class={merge("gap-3 [&>[aria-hidden='true']]:-ml-2", className)}
    >
      <RadioControl
        {group}
        aria-describedby={description ? `${id}-description` : null}
        data-track-name="radio-input"
        data-track-intent="select"
        data-track-text={label}
        {name}
        {value}
        {id}
        {disabled}
        {required}
        {...rest}
      />
      <span class:hidden={labelHidden}>
        {label}
      </span>
    </Label>
  </div>
  {#if description}
    <p class="description" id="{id}-description">
      {description}
    </p>
  {/if}
</div>

<style lang="postcss">
  .description {
    @apply ml-8 text-sm font-normal text-secondary;
  }
</style>
