<script lang="ts" module>
  export const RADIO_GROUP_CONTEXT = 'radio-group-ctx';
</script>

<script lang="ts" generics="T">
  import { setContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { RadioGroupContext, RadioGroupProps } from './types';

  type Props = RadioGroupProps<T> & {
    class?: string;
    children?: Snippet;
  };

  let {
    name,
    group,
    description = '',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const labelId = $props.id();

  setContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT, {
    get name() {
      return name;
    },
    get group() {
      return group;
    },
  });
</script>

<div
  class={merge('flex flex-col gap-4 p-1', className)}
  role="radiogroup"
  aria-labelledby={description ? labelId : undefined}
  {...rest}
>
  {#if description}
    <p id={labelId} class="text-sm font-medium">{description}</p>
  {/if}
  {@render children?.()}
</div>
