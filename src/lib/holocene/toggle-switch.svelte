<!-- Based loosely on https://www.w3.org/WAI/ARIA/apg/patterns/switch/examples/switch-checkbox/a -->
<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';

  export let id: string;
  export let label: string;
  export let disabled = false;
  export let checked = false;
  export let labelPosition: 'left' | 'right' = 'right';
  export let labelHidden = false;
</script>

<Label
  class={merge(
    'group relative flex w-fit min-w-fit rounded px-2',
    labelPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
    disabled && 'opacity-50',
  )}
  {disabled}
  data-testid={$$props['data-testid']}
>
  <span
    class="whitespace-nowrap text-sm font-medium"
    class:sr-only={labelHidden}
  >
    {label}
  </span>
  <input
    on:change
    bind:checked
    {id}
    {disabled}
    type="checkbox"
    class="peer sr-only"
    role="switch"
  />
  <span
    class="surface-background not-sr-only flex h-5 w-9 items-center rounded-xl border border-secondary p-px peer-checked:justify-end peer-checked:border-interactive peer-checked:bg-interactive peer-checked:text-off-white {disabled
      ? ''
      : 'group-hover:border-information group-hover:bg-interactive-secondary-hover group-hover:peer-checked:bg-interactive-hover'} peer-focus-visible:border-inverse peer-focus-visible:bg-interactive-secondary-hover peer-focus-visible:ring-4 peer-focus-visible:ring-primary/70 peer-focus-visible:peer-checked:bg-interactive-hover"
  >
    <span class="h-4 w-4 rounded-[50%] bg-current"></span>
  </span>
</Label>
