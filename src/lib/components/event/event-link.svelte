<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink } from '$lib/types';
  import {
    type EventLinkContext,
    type EventLinkDisplay,
    toEventLinkView,
  } from '$lib/utilities/event-link';

  interface Props {
    link?: EventLink;
    view?: EventLinkDisplay;
    context?: EventLinkContext;
    value?: string;
    label?: string;
    href?: string;
    class?: string;
    linkClass?: string;
    labelClass?: string;
  }

  let {
    link,
    view,
    context = {},
    value,
    label,
    href,
    class: className = '',
    linkClass = '',
    labelClass = 'text-sm',
  }: Props = $props();

  const linkView = $derived(
    view ?? (link ? toEventLinkView(link, context) : undefined),
  );
  const resolvedHref = $derived(href ?? linkView?.href);
  const resolvedValue = $derived(
    value ?? linkView?.value ?? resolvedHref ?? '',
  );
  const resolvedLabel = $derived(
    label ?? linkView?.label ?? translate('nexus.link'),
  );
</script>

<div
  class="flex flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 {className}"
>
  <p class="max-w-fit whitespace-nowrap text-right {labelClass}">
    {resolvedLabel}
  </p>
  <div class="overflow-hidden {linkClass}">
    {#if resolvedHref}
      <Link href={resolvedHref}>
        {resolvedValue}
      </Link>
    {:else}
      <span>{resolvedValue}</span>
    {/if}
  </div>
</div>
