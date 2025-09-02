<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import { translate } from '$lib/i18n/translate';

  let screenWidth: number;

  let className: ClassNameValue = '';
  export { className as class };
</script>

<svelte:window bind:innerWidth={screenWidth} />
<nav
  class={merge(
    'surface-primary',
    'sticky top-0 z-40',
    'hidden md:flex',
    'w-full',
    'flex-col md:flex-row',
    'items-center justify-end',
    'border-b border-subtle',
    'p-1 px-4 md:px-8',
    className,
  )}
  data-testid="top-nav"
  aria-label={translate('common.main')}
>
  <div class="flex grow items-center">
    <slot name="left" />
  </div>
  <div class="flex items-center gap-2">
    <span class="flex items-center gap-1.5">
      <kbd
        class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
      >
        <span class="text-slate-400">Cmd + K</span>
      </kbd></span
    >

    <TimezoneSelect position={screenWidth < 768 ? 'left' : 'right'} />
    <DataEncoderStatus />
    <DarkModeMenu hideLabel position={screenWidth < 768 ? 'left' : 'right'} />
    <slot />
  </div>
</nav>
