<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  type $$Props = HTMLLabelAttributes & {
    label?: string;
    hidden?: boolean;
    required?: boolean;
    disabled?: boolean;
  };

  export let label = '';
  export let hidden = false;
  export let required = false;
  export let disabled = false;

  let className = '';
  export { className as class };
</script>

<label
  {...$$restProps}
  class={merge(
    'flex grow cursor-pointer flex-row items-center gap-2 font-secondary text-sm font-medium font-normal text-primary text-primary focus:outline-none',
    className,
  )}
  class:sr-only={hidden}
  class:cursor-not-allowed={disabled}
>
  <slot>{label}</slot>
  {#if required}
    <span class="text-red-500">*</span>
  {/if}
</label>
