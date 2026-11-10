<script lang="ts">
  import { page } from '$app/state';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalNexus } from '$lib/io/icon';
  import type { EventLink as EventLinkType } from '$lib/types';
  import type { Callback } from '$lib/types/nexus';
  import {
    callbackBannerKind,
    callbackBannerTitle,
    callbackStateCounts,
  } from '$lib/utilities/callback-banner';
  import { toEventLinkViews } from '$lib/utilities/event-link';
  import { callbackDeliveryState } from '$lib/utilities/nexus-operation-callbacks';

  import EventLink from '../event/event-link.svelte';

  interface Props {
    callbacks: Callback[];
    workerCallbackLinks?: EventLinkType[];
    fallbackLink?: EventLinkType;
    perspective?: 'caller' | 'handler';
    linksHref?: string;
    linkCount?: number;
  }

  let {
    callbacks,
    workerCallbackLinks = [],
    fallbackLink,
    perspective = 'handler',
    linksHref,
    linkCount,
  }: Props = $props();

  const kind = $derived(
    callbackBannerKind(callbacks.length, workerCallbackLinks.length),
  );
  const callback = $derived(callbacks[0]);
  const state = $derived(callback ? String(callback.state ?? '') : undefined);
  const deliveryState = $derived(callbackDeliveryState(state));
  const failed = $derived(state === 'Failed');
  const failure = $derived(callback?.lastAttemptFailure?.message);
  const blockedReason = $derived(callback?.blockedReason);
  const completedTime = $derived($timestamp(callback?.lastAttemptCompleteTime));

  const singleLinks = $derived.by(() => {
    if (!callback) return workerCallbackLinks.slice(0, 1);
    const ownLinks = callback.callback?.links ?? [];
    if (ownLinks.length) return ownLinks;
    return fallbackLink ? [fallbackLink] : [];
  });
  const linkViews = $derived(
    toEventLinkViews(singleLinks, {
      namespace: page.params.namespace,
      perspective: perspective === 'caller' ? 'caller' : undefined,
    }),
  );
  const stateCounts = $derived(callbackStateCounts(callbacks));
  const viewLinksText = $derived(
    linkCount
      ? translate('nexus.callback-summary-view-links-count', {
          count: linkCount,
        })
      : translate('nexus.callback-summary-view-links'),
  );
</script>

{#snippet value(text: string)}
  <span
    class="rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-secondary"
    >{text}</span
  >
{/snippet}

{#if kind === 'single'}
  <Alert
    Icon={IconTemporalNexus}
    intent={failed ? 'error' : 'info'}
    title={callbackBannerTitle(state)}
    data-testid="callback-banner"
  >
    <div class="flex flex-col gap-2 pt-2">
      {#each linkViews as view (view.key)}
        {#if perspective === 'caller' && view.event}
          <EventLink view={view.event} />
        {:else}
          <EventLink {view} label={translate('nexus.callback-link')} />
        {/if}
        {#if view.namespace}
          <EventLink
            view={view.namespace}
            label={translate('nexus.caller-namespace')}
          />
        {/if}
      {/each}
      {#if callback}
        <div
          class="flex flex-col items-start gap-2 md:flex-row md:items-center"
        >
          <p class="flex items-center gap-2">
            {translate('common.state')}
            {@render value(deliveryState.label)}
          </p>
          {#if callback.attempt}
            <p class="flex items-center gap-2">
              {translate('common.attempt')}
              {@render value(String(callback.attempt))}
            </p>
          {/if}
          {#if callback.lastAttemptCompleteTime}
            <p class="flex items-center gap-2">
              {translate('nexus.last-attempt-completed-time')}
              {@render value(completedTime)}
            </p>
          {/if}
        </div>
      {/if}
      {#if blockedReason}
        <p class="flex items-center gap-2">
          {translate('nexus.blocked-reason')}
          {@render value(blockedReason)}
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
  </Alert>
{:else if kind === 'summary'}
  <Alert
    Icon={IconTemporalNexus}
    intent="info"
    title={translate('nexus.callback-summary-title')}
    data-testid="callback-banner"
  >
    <dl class="flex flex-col gap-2 pt-2">
      {#each stateCounts as { state, label, count } (state)}
        <div class="flex items-center gap-2" data-testid="callback-state-count">
          <dt>{label}</dt>
          <dd>{@render value(String(count))}</dd>
        </div>
      {/each}
    </dl>
    {#if linksHref}
      <p class="flex items-center gap-2 pt-2">
        {translate('nexus.callback-summary-review-links')}
        <Link href={linksHref}>{viewLinksText}</Link>
      </p>
    {/if}
  </Alert>
{/if}
