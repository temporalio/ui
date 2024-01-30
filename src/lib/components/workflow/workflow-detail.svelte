<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  export let title = '';
  export let content: string;
  export let copyable = false;
  export let href: string = null;
  export let textSize = 'md';
  export let icon: IconName | undefined = undefined;
</script>

<p class="flex items-center gap-2 text-{textSize} whitespace-nowrap pt-2">
  {#if copyable}
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {content}
      visible
      container-class="gap-1 w-full"
    >
      {#if icon}
        <Icon name={icon} />
      {/if}
      {#if title}
        {title}
      {/if}
      {#if href}
        <Link {href} class="value">{content}</Link>
      {:else}
        <span class="value select-all">{content}</span>
      {/if}
    </Copyable>
  {:else}
    {#if icon}
      <Icon name={icon} />
    {/if}
    {#if title}
      {title}
    {/if}
    {#if href}
      <Link {href} class="value">{content}</Link>
    {:else}
      <span class="value select-all">{content}</span>
    {/if}
  {/if}
</p>

<style lang="postcss">
  .value {
    @apply flex w-fit flex-row items-center justify-center truncate break-all rounded-sm bg-slate-100 p-1 leading-4 transition-colors;
  }
</style>
