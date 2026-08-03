<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { CallbackState } from '$lib/types';
  import type { EventLink as Link } from '$lib/types';
  import type { Callback } from '$lib/types/nexus';
  import {
    type EventLinkView,
    toEventLinkViews,
  } from '$lib/utilities/event-link';

  import EventLink from '../event/event-link.svelte';

  let {
    callback,
    link,
    children,
  }: { callback: Callback; link?: Link; children?: Snippet } = $props();

  const completedTime = $derived($timestamp(callback.lastAttemptCompleteTime));
  const nextTime = $derived($timestamp(callback.nextAttemptScheduleTime));
  const failure = $derived(callback?.lastAttemptFailure?.message);
  const blockedReason = $derived(callback?.blockedReason);
  const callbackUrl = $derived(callback?.callback?.nexus?.url);

  const titles: Record<string, string> = {
    Standby: translate('nexus.callback.standby'),
    Scheduled: translate('nexus.callback.scheduled'),
    'Backing Off': translate('nexus.callback.backing-off'),
    Failed: translate('nexus.callback.failed'),
    Succeeded: translate('nexus.callback.succeeded'),
  };

  const failedState = 'Failed' as unknown as CallbackState;
  const failed = $derived(callback.state === failedState);
  const title = $derived(
    titles[callback.state ?? ''] || translate('nexus.nexus-callback'),
  );
  const links = $derived(callback?.callback?.links || []);
  const showCallbackUrl = $derived(!links.length && !link && callbackUrl);
  const namespace = $derived(page.params.namespace);
  const callbackLinks = $derived(links.length ? links : link ? [link] : []);
  const linkViews = $derived(toEventLinkViews(callbackLinks, { namespace }));
</script>

{#snippet callbackLink(view: EventLinkView)}
  <EventLink {view} />
  {#if view.namespace}
    <EventLink view={view.namespace} />
  {/if}
{/snippet}

<Alert icon="nexus" intent={failed ? 'error' : 'info'} {title}>
  <div class="flex flex-col gap-2 pt-2">
    {#each linkViews as view (view.key)}
      {@render callbackLink(view)}
    {/each}
    <div class="flex flex-col items-start gap-2 md:flex-row md:items-center">
      <p class="flex items-center gap-2">
        {translate('common.state')}<Badge type="subtle">{callback.state}</Badge>
      </p>
      {#if callback.attempt}
        <p class="flex items-center gap-2">
          {translate('common.attempt')}
          <Badge type="subtle">{callback.attempt}</Badge>
        </p>
      {/if}
      {#if callback.lastAttemptCompleteTime}
        <p class="flex items-center gap-2">
          {translate('nexus.last-attempt-completed-time')}
          <Badge type="subtle">{completedTime}</Badge>
        </p>
      {/if}
      {#if callback.nextAttemptScheduleTime}
        <p class="flex items-center gap-2">
          {translate('nexus.next-attempt-scheduled-time')}
          <Badge type="subtle">{nextTime}</Badge>
        </p>
      {/if}
    </div>
    {#if showCallbackUrl}
      <p class="flex items-center gap-2">
        {translate('nexus.callback-url')}
        <Badge type="subtle">{callbackUrl}</Badge>
      </p>
    {/if}
    {#if blockedReason}
      <p class="flex items-center gap-2">
        {translate('nexus.blocked-reason')}
        <Badge type="subtle">{blockedReason}</Badge>
      </p>
    {/if}
    {#if failure}
      <div class="flex flex-col gap-2">
        <p>{translate('nexus.last-attempt-failure')}</p>
        <CodeBlock
          content={failure}
          label={translate('workflows.callback-metadata')}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {/if}
  </div>
  {@render children?.()}
</Alert>
