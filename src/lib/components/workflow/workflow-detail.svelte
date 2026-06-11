<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  type Props = {
    title?: string;
    content: string;
    copyable?: boolean;
    href?: string | null;
    textSize?: string;
    icon?: IconName | undefined;
    tooltip?: string;
  };

  let {
    title = '',
    content,
    copyable = false,
    href = null,
    textSize = 'md',
    icon = undefined,
    tooltip = '',
  }: Props = $props();
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
        <Link
          {href}
          class="surface-subtle w-fit truncate rounded-sm p-1 leading-4"
          >{content}</Link
        >
      {:else}
        <Tooltip text={tooltip} hide={!tooltip} top>
          <span
            class="surface-subtle w-fit select-all truncate rounded-sm p-1 leading-4"
            >{content}</span
          >
        </Tooltip>
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
      <Link
        {href}
        class="surface-subtle w-fit truncate rounded-sm p-1 leading-4"
        >{content}</Link
      >
    {:else}
      <Tooltip text={tooltip} hide={!tooltip} top>
        <span
          class="surface-subtle w-fit select-all truncate rounded-sm p-1 leading-4"
          >{content}</span
        >
      </Tooltip>
    {/if}
  {/if}
</p>
