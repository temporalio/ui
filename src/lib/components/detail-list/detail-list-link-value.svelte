<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { type IconComponent } from '$lib/io/icon';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    copyable?: boolean;
    copyableText?: string;
    text: string;
    href: string;
    isBadge?: boolean;
    Icon?: IconComponent | undefined;
  }

  let {
    copyable = false,
    text,
    copyableText = text,
    href,
    isBadge = false,
    Icon,
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

    {#if Icon}
      <Icon class="shrink-0" />
    {/if}
  </Link>
</DetailListValue>
