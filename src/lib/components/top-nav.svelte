<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';

  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import { translate } from '$lib/i18n/translate';

  let className: ClassNameValue = '';
  export { className as class };

  const md = new MediaQuery('min-width:768px');
</script>

{#if md.current}
  <nav
    class={merge(
      'surface-primary',
      'sticky top-0 z-40',
      'flex',
      'w-full',
      'flex-row',
      'items-center justify-end',
      'border-b border-subtle',
      'px-8 py-1',
      className,
    )}
    data-testid="top-nav"
    aria-label={translate('common.main')}
  >
    <div class="flex grow items-center">
      <slot name="left" />
    </div>
    <div class="flex items-center gap-2">
      <TimezoneSelect />
      <DataEncoderStatus />
      <slot />
    </div>
  </nav>
{/if}
