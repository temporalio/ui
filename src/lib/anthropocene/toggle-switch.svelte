<!-- Based loosely on https://www.w3.org/WAI/ARIA/apg/patterns/switch/examples/switch-checkbox/a -->
<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/anthropocene/label.svelte';

  interface Props {
    id: string;
    label: string;
    disabled?: boolean;
    checked?: boolean;
    labelPosition?: 'left' | 'right';
    labelHidden?: boolean;
    'data-testid'?: string;
    onchange?: (event: Event) => void;
  }

  let {
    id,
    label,
    disabled = false,
    checked = $bindable(false),
    labelPosition = 'right',
    labelHidden = false,
    'data-testid': testId,
    onchange,
  }: Props = $props();
</script>

<Label
  class={merge(
    'group relative flex w-fit min-w-fit rounded',
    labelPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
    disabled && 'opacity-50',
  )}
  {disabled}
  data-testid={testId}
>
  <span
    class="whitespace-nowrap text-sm font-medium"
    class:sr-only={labelHidden}
  >
    {label}
  </span>
  <input
    {onchange}
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
      : 'group-hover:border-information group-hover:bg-interactive-secondary-hover group-hover:peer-checked:bg-interactive-hover'} peer-focus-visible:border-inverse peer-focus-visible:bg-interactive-secondary-hover peer-focus-visible:ring-2 peer-focus-visible:ring-primary/70 peer-focus-visible:peer-checked:bg-interactive-hover"
  >
    <span class="h-4 w-4 rounded-[50%] bg-current"></span>
  </span>
</Label>
