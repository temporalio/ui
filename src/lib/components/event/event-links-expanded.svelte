<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { EventLink as ELink } from '$lib/types/events';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import EventLink from './event-link.svelte';

  export let links: ELink[] = [];
</script>

{#each links as link}
  {#if link?.workflowEvent}
    <div class="flex w-full items-center gap-4 p-2">
      <EventLink {link} />
    </div>
    <div class="flex w-full items-center gap-4 p-2">
      <EventLink
        {link}
        label={translate('nexus.link-namespace')}
        value={link.workflowEvent.namespace}
        href={routeForNamespace({ namespace: link.workflowEvent.namespace })}
      />
    </div>
  {/if}
{/each}
