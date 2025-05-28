<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventLink } from '$lib/types/events';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';

  export let link: EventLink;
  export let value = link.workflowEvent.workflowId;
  export let label = translate('nexus.link');
  export let href: string | undefined = undefined;

  $: if (!href) {
    href = getEventLinkHref(link);
    value = href.split('workflows/')?.[1] || href;
  }
</script>

<div
  class="flex flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-sm">
    {label}
  </p>
  <div class="overflow-hidden {$$props.linkClass}">
    <Link {href}>
      {value}
    </Link>
  </div>
</div>
