<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    copyable?: boolean;
    copyableText?: string;
    text: string;
    href: string;
    isBadge?: boolean;
    iconName?: IconName | undefined;
  }

  let {
    copyable = false,
    text,
    copyableText = text,
    href,
    isBadge = false,
    iconName = undefined,
  }: Props = $props();
</script>

<DetailListValue {copyable} {copyableText}>
  <Link
    {href}
    class="flex w-fit flex-row items-center gap-1 truncate rounded-sm {isBadge &&
      'surface-subtle'}"
  >
    <span class="truncate">
      {text}
    </span>

    {#if iconName}
      <Icon name={iconName} class="shrink-0" />
    {/if}
  </Link>
</DetailListValue>
