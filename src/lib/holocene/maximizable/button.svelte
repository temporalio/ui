<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    maximized: boolean;
    onclick: (e: MouseEvent) => void;
    class?: string;
    'data-testid'?: string;
    'data-theme'?: string;
  }

  let { maximized, onclick, class: className = undefined }: Props = $props();

  const minimizeText = translate('common.minimize');
  const maximizeText = translate('common.maximize');

  const iconTitle = $derived(maximized ? minimizeText : maximizeText);
  const svgName = $derived(maximized ? 'minimize' : 'expand');
</script>

<button
  class={merge(
    'maximizable-button surface-interactive-secondary m-1 border border-[transparent] bg-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    className,
  )}
  {onclick}
>
  <Icon title={iconTitle} name={svgName} />
</button>

<style>
  @media (pointer: coarse) {
    .maximizable-button {
      min-width: var(--target-size);
      min-height: var(--target-size);
    }
  }
</style>
