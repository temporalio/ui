<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface $$Props extends HTMLButtonAttributes {
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
    copied: boolean;
    'data-testid'?: string;
    'data-theme'?: string;
    class?: string;
  }

  export let copyIconTitle: string = translate('common.copy-icon-title');
  export let copySuccessIconTitle: string = translate(
    'common.copy-success-icon-title',
  );
  export let copied: boolean;

  let className = '';
  export { className as class };
</script>

<button
  class={merge(
    'surface-interactive-secondary focus-visible:ring-primary/70 h-6 border border-[transparent] bg-transparent p-1 focus-visible:ring-2 focus-visible:outline-none',
    className,
  )}
  data-track-name="copyable-button"
  data-track-intent="copy"
  data-track-text={copyIconTitle}
  on:click
  {...$$restProps}
>
  <Icon
    title={copied ? copySuccessIconTitle : copyIconTitle}
    name={copied ? 'checkmark' : 'copy'}
  />
</button>
