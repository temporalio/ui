<script lang="ts">
  import Badge, { type BadgeType } from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  export let title = '';
  export let content: string;
  export let copyable = false;
  export let filterable = false;
  export let href: string = null;
  export let icon: IconName | undefined = undefined;
  export let tooltip: string = '';
  export let badge: BadgeType | undefined = undefined;
</script>

<p
  class="flex items-center justify-between gap-16 truncate whitespace-nowrap {$$restProps.class}"
>
  {#if title}
    <span class="font-mono">{title}</span>
  {/if}
  {#if copyable}
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {content}
      visible
      container-class="gap-1 w-full justify-end"
    >
      {#if href}
        <Link
          {href}
          class="flex w-fit flex-row items-center gap-1 truncate rounded-sm leading-4"
          ><span class="truncate">{content}</span>
          {#if filterable}
            <Icon name="filter" class="shrink-0" />
          {/if}
        </Link>
      {:else}
        <Tooltip text={tooltip} hide={!tooltip} top>
          <span class="w-fit select-all truncate rounded-sm leading-4"
            >{content}</span
          >
        </Tooltip>
      {/if}
    </Copyable>
  {:else if href}
    <Link {href} class="value eading-4 truncate rounded-sm">{content}</Link>
  {:else}
    <Tooltip text={tooltip} hide={!tooltip} top>
      {#if badge}
        <Badge
          type={badge}
          class="w-fit select-all truncate rounded-sm leading-4"
        >
          {#if icon}
            <Icon name={icon} class="mx-1" />
          {/if}
          {content}
        </Badge>
      {:else}
        <span class="w-fit select-all truncate rounded-sm leading-4">
          {#if icon}
            <Icon name={icon} class="mx-1" />
          {/if}
          {content}</span
        >
      {/if}
    </Tooltip>
  {/if}
</p>
