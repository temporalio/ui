<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconCheckmark, IconCopy } from '$lib/io/icon';

  interface Props extends HTMLButtonAttributes {
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
    copied: boolean;
    'data-testid'?: string;
    'data-theme'?: string;
    class?: string;
  }

  let {
    copyIconTitle = translate('common.copy-icon-title'),
    copySuccessIconTitle = translate('common.copy-success-icon-title'),
    copied,
    class: className = '',
    ...rest
  }: Props = $props();

  const Glyph = $derived(copied ? IconCheckmark : IconCopy);
</script>

<button
  class={merge(
    'h-6 border border-transparent bg-transparent p-1 text-io-content-primary hover:bg-io-actions-hover-overlay focus-visible:bg-io-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-io-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-io-background-primary active:bg-io-actions-press-overlay',
    className,
  )}
  data-track-name="copyable-button"
  data-track-intent="copy"
  data-track-text={copyIconTitle}
  {...rest}
>
  <Glyph title={copied ? copySuccessIconTitle : copyIconTitle} />
</button>
