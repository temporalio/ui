<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    class?: ClassNameValue;
    left?: Snippet;
    children?: Snippet;
  }

  let { class: className = '', children, left }: Props = $props();

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
      {@render left?.()}
    </div>
    <div class="flex items-center gap-2">
      <TimezoneSelect />
      <DataEncoderStatus />
      {@render children?.()}
    </div>
  </nav>
{/if}
