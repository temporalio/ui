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
    'group relative flex w-fit min-w-fit cursor-pointer rounded px-2 text-primary',
    labelPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
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
    class="surface-subtle not-sr-only flex h-5 w-9 items-center rounded-xl border border-transparent p-px text-primary outline-2 outline-offset-1 outline-brand/50 group-hover:border-brand peer-checked:justify-end peer-checked:bg-brand peer-checked:text-inverse peer-focus:outline peer-disabled:opacity-50"
  >
    <span class="h-4 w-4 rounded-[50%] bg-current" />
  </span>
</Label>
