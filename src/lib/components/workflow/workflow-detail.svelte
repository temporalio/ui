<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type IconComponent } from '$lib/io/icon';

  type Props = {
    title?: string;
    content: string;
    copyable?: boolean;
    href?: string | null;
    textSize?: string;
    Icon?: IconComponent | undefined;
    tooltip?: string;
  };

  let {
    title = '',
    content,
    copyable = false,
    href = null,
    textSize = 'md',
    Icon,
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
      {#if Icon}
        <Icon />
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
    {#if Icon}
      <Icon />
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
