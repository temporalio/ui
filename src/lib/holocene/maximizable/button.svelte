<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowExpand, IconArrowMinimize } from '$lib/io/icon';

  interface Props extends Omit<HTMLButtonAttributes, 'class'> {
    maximized: boolean;
    class?: ClassNameValue;
  }

  let { maximized, onclick, class: className, ...rest }: Props = $props();

  const minimizeText = translate('common.minimize');
  const maximizeText = translate('common.maximize');

  const iconTitle = $derived(maximized ? minimizeText : maximizeText);
  const Glyph = $derived(maximized ? IconArrowMinimize : IconArrowExpand);
</script>

<button
  type="button"
  class={merge(
    'm-1 border border-transparent bg-transparent p-1 text-primary hover:bg-action-hover-overlay focus-visible:bg-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary active:bg-action-press-overlay',
    className,
  )}
  {onclick}
  {...rest}
>
  <Glyph title={iconTitle} />
</button>
