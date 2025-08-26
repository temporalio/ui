<script lang="ts">
  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    paddingX?: string;
    paddingXMd?: string;
  }

  let { paddingX = 'px-4', paddingXMd = 'md:px-8' }: Props = $props();

  let screenWidth: number;
</script>

<svelte:window bind:innerWidth={screenWidth} />
<nav
  class="surface-primary sticky top-0 z-40 hidden w-full flex-col items-center justify-end border-b border-subtle p-1 {paddingX} md:flex md:flex-row {paddingXMd}"
  data-testid="top-nav"
  aria-label={translate('common.main')}
>
  <div class="flex grow items-center">
    <slot name="left" />
  </div>
  <div class="flex items-center gap-2">
    <TimezoneSelect position={screenWidth < 768 ? 'left' : 'right'} />
    <DataEncoderStatus />
    <DarkModeMenu hideLabel position={screenWidth < 768 ? 'left' : 'right'} />
    <slot />
  </div>
</nav>
