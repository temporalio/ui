<script lang="ts">
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
  export let badge = false;
</script>

<p class="flex items-center gap-2 whitespace-nowrap {$$restProps.class}">
  {#if copyable}
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {content}
      visible
      container-class="gap-1 w-full h-4"
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
          class="flex w-fit flex-row items-center gap-1 truncate rounded-sm p-1 leading-4 {badge &&
            'surface-subtle'}"
          ><span class="truncate font-bold">{content}</span>
          {#if filterable}
            <Icon name="filter" class="shrink-0" />
          {/if}
        </Link>
      {:else}
        <Tooltip text={tooltip} hide={!tooltip} top>
          <span
            class="w-fit select-all truncate rounded-sm p-1 font-bold leading-4"
            class:surface-subtle={badge}>{content}</span
          >
        </Tooltip>
      {/if}
    </Copyable>
  {:else}
    {#if title}
      {title}
    {/if}
    {#if icon}
      <Icon name={icon} />
    {/if}
    {#if href}
      <Link
        {href}
        class="value truncate rounded-sm p-1 font-bold leading-4 {badge &&
          'surface-subtle'}">{content}</Link
      >
    {:else}
      <Tooltip text={tooltip} hide={!tooltip} top>
        <span
          class="w-fit select-all truncate rounded-sm p-1 font-bold leading-4"
          class:surface-subtle={badge}>{content}</span
        >
      </Tooltip>
    {/if}
  {/if}
</p>
