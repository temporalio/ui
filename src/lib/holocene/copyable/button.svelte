<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

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
</script>

<button
  class={merge(
    'surface-interactive-secondary h-6 border border-[transparent] bg-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    className,
  )}
  data-track-name="copyable-button"
  data-track-intent="copy"
  data-track-text={copyIconTitle}
  {...rest}
>
  <Icon
    title={copied ? copySuccessIconTitle : copyIconTitle}
    name={copied ? 'checkmark' : 'copy'}
  />
</button>
