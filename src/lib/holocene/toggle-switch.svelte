<!-- Based loosely on https://www.w3.org/WAI/ARIA/apg/patterns/switch/examples/switch-checkbox/a -->
<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';

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
    data-track-name="toggle-switch"
    data-track-intent="toggle"
    data-track-text={label}
  />
  <span
    class={merge(
      'not-sr-only flex h-5 w-9 items-center rounded-xl border border-io-border-tertiary bg-io-interactive-secondary p-px text-io-content-primary peer-checked:justify-end peer-checked:border-io-interactive-primary peer-checked:bg-io-interactive-primary peer-checked:text-io-content-white',
      !disabled &&
        'group-hover:border-io-border-brand group-hover:bg-io-actions-hover-overlay group-active:bg-io-actions-press-overlay group-hover:peer-checked:border-io-interactive-primary-hover group-hover:peer-checked:bg-io-interactive-primary-hover group-active:peer-checked:border-io-interactive-primary-press group-active:peer-checked:bg-io-interactive-primary-press peer-focus-visible:ring-2 peer-focus-visible:ring-io-interactive-primary',
    )}
  >
    <span class="h-4 w-4 rounded-[50%] bg-current"></span>
  </span>
</Label>
