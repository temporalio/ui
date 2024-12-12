<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { EventLink as ELink } from '$lib/types/events';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import EventLink from './event-link.svelte';

  export let links: ELink[] = [];
</script>

{#each links as link}
  {#if link?.workflowEvent}
    <div
      class="block flex w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex"
    >
      <EventLink {link} />
    </div>
    <div
      class="block flex w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex"
    >
      <EventLink
        {link}
        label={translate('nexus.link-namespace')}
        value={link.workflowEvent.namespace}
        href={routeForNamespace({ namespace: link.workflowEvent.namespace })}
      />
    </div>
  {/if}
{/each}

<style lang="postcss">
  .content {
    @apply block flex w-full w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex;
  }
</style>
