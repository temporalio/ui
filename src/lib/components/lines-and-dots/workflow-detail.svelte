<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type IconComponent, IconFilter } from '$lib/io/icon';

  interface Props {
    title?: string;
    content: string;
    copyable?: boolean;
    filterable?: boolean;
    href?: string;
    Icon?: IconComponent;
    tooltip?: string;
    badge?: BadgeType;
    class?: string;
  }

  let {
    title = '',
    content,
    copyable = false,
    filterable = false,
    href,
    Icon,
    tooltip = '',
    badge,
    class: className = '',
  }: Props = $props();
</script>

<p
  class="flex items-center justify-between gap-16 truncate whitespace-nowrap {className}"
>
  {#if title}
    {title}
  {/if}
  {#if copyable}
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {content}
      visible
      container-class="gap-1 w-full justify-end font-mono"
    >
      {#if href}
        <Link
          {href}
          class="flex w-fit flex-row items-center gap-1 truncate rounded-sm font-mono leading-4"
          ><span class="truncate">{content}</span>
          {#if filterable}
            <IconFilter class="shrink-0" />
          {/if}
        </Link>
      {:else}
        <Tooltip text={tooltip} hide={!tooltip} top>
          <span class="w-fit select-all truncate rounded-sm font-mono leading-4"
            >{content}</span
          >
        </Tooltip>
      {/if}
    </Copyable>
  {:else if href}
    <Link {href} class="value eading-4 truncate rounded-sm font-mono"
      >{content}</Link
    >
  {:else}
    <Tooltip text={tooltip} hide={!tooltip} top>
      {#if badge}
        <Badge
          type={badge}
          class="w-fit select-all gap-1 truncate rounded-sm px-1 font-mono leading-4"
        >
          {#if Icon}
            <Icon class="shrink-0" />
          {/if}
          {content}
        </Badge>
      {:else}
        <span
          class="w-fit select-all gap-1 truncate rounded-sm px-1 font-mono leading-4"
        >
          {#if Icon}
            <Icon class="shrink-0" />
          {/if}
          {content}</span
        >
      {/if}
    </Tooltip>
  {/if}
</p>
