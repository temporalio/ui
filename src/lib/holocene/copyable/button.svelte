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
    'h-6 border border-transparent bg-transparent p-1 text-primary hover:bg-interactive-tertiary-hover focus-visible:bg-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary active:bg-interactive-tertiary-press',
    className,
  )}
  data-track-name="copyable-button"
  data-track-intent="copy"
  data-track-text={copyIconTitle}
  {...rest}
>
  <Glyph class="size-4" title={copied ? copySuccessIconTitle : copyIconTitle} />
</button>
