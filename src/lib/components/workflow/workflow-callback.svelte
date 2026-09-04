<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { BadgeCount } from '$lib/io/badge-count';
  import { IconTemporalNexus } from '$lib/io/icon';
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
    perspective = 'handler',
    children,
  }: {
    callback: Callback;
    link?: Link;
    perspective?: 'caller' | 'handler';
    children?: Snippet;
  } = $props();

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

  const state = $derived(String(callback.state ?? ''));
  const failed = $derived(state === 'Failed');
  const stateColorScheme = $derived(
    state === 'Succeeded'
      ? 'success'
      : state === 'Failed'
        ? 'danger'
        : state === 'Backing Off'
          ? 'warning'
          : 'neutral',
  );
  const title = $derived(titles[state] || translate('nexus.nexus-callback'));
  const links = $derived(callback?.callback?.links || []);
  const showCallbackUrl = $derived(!links.length && !link && callbackUrl);
  const namespace = $derived(page.params.namespace);
  const callbackLinks = $derived(links.length ? links : link ? [link] : []);
  const linkViews = $derived(
    toEventLinkViews(callbackLinks, {
      namespace,
      perspective: perspective === 'caller' ? 'caller' : undefined,
    }),
  );
</script>

{#snippet callbackLink(view: EventLinkView)}
  {#if perspective === 'caller' && view.event}
    <EventLink view={view.event} />
  {:else}
    <EventLink {view} />
  {/if}
  {#if view.namespace}
    <EventLink view={view.namespace} />
  {/if}
{/snippet}

<Alert Icon={IconTemporalNexus} intent={failed ? 'error' : 'info'} {title}>
  <div class="flex flex-col gap-2 pt-2">
    {#each linkViews as view (view.key)}
      {@render callbackLink(view)}
    {/each}
    <div class="flex flex-col items-start gap-2 md:flex-row md:items-center">
      <p class="flex items-center gap-2">
        {translate('common.state')}
        <Badge text={state} colorScheme={stateColorScheme} />
      </p>
      {#if callback.attempt}
        <p class="flex items-center gap-2">
          {translate('common.attempt')}
          <BadgeCount value={callback.attempt} />
        </p>
      {/if}
      {#if callback.lastAttemptCompleteTime}
        <p class="flex items-center gap-2">
          {translate('nexus.last-attempt-completed-time')}
          <span
            class="rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-secondary"
            >{completedTime}</span
          >
        </p>
      {/if}
      {#if callback.nextAttemptScheduleTime}
        <p class="flex items-center gap-2">
          {translate('nexus.next-attempt-scheduled-time')}
          <span
            class="rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-secondary"
            >{nextTime}</span
          >
        </p>
      {/if}
    </div>
    {#if showCallbackUrl}
      <p class="flex items-center gap-2">
        {translate('nexus.callback-url')}
        <span
          class="break-all rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-secondary"
        >
          {callbackUrl}
        </span>
      </p>
    {/if}
    {#if blockedReason}
      <p class="flex items-center gap-2">
        {translate('nexus.blocked-reason')}
        <span
          class="rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 text-secondary"
          >{blockedReason}</span
        >
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
