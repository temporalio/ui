<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowExpand, IconArrowMinimize } from '$lib/io/icon';

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
  const Glyph = $derived(maximized ? IconArrowMinimize : IconArrowExpand);
</script>

<button
  class={merge(
    'm-1 border border-transparent bg-transparent p-1 text-primary hover:bg-action-hover-overlay focus-visible:bg-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary active:bg-action-press-overlay',
    className,
  )}
  {onclick}
>
  <Glyph title={iconTitle} />
</button>
