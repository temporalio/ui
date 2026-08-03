<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink } from '$lib/types';
  import {
    type EventLinkContext,
    type EventLinkDisplay,
    toEventLinkView,
  } from '$lib/utilities/event-link';

  export let link: EventLink | undefined = undefined;
  export let view: EventLinkDisplay | undefined = undefined;
  export let context: EventLinkContext = {};
  export let value: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let href: string | undefined = undefined;

  $: linkView = view ?? (link ? toEventLinkView(link, context) : undefined);
  $: resolvedHref = href ?? linkView?.href;
  $: resolvedValue = value ?? linkView?.value ?? resolvedHref ?? '';
  $: resolvedLabel = label ?? linkView?.label ?? translate('nexus.link');
</script>

<div
  class="flex flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-sm">
    {resolvedLabel}
  </p>
  <div class="overflow-hidden {$$props.linkClass}">
    {#if resolvedHref}
      <Link href={resolvedHref}>
        {resolvedValue}
      </Link>
    {:else}
      <span>{resolvedValue}</span>
    {/if}
  </div>
</div>
