<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { createNewsFeedStore } from '$lib/stores/news-feed';
  import {
    hourFormat,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  type NewsFeedStore = ReturnType<typeof createNewsFeedStore>;

  interface Props {
    newsFeed: NewsFeedStore;
    open?: boolean;
    previewTheme?: 'dark' | 'light';
  }

  let { newsFeed, open = $bindable(false), previewTheme }: Props = $props();

  const lastFetchedLabel = $derived(
    $newsFeed.fetchedAt
      ? translate('common.news-feed-last-fetched', {
          date: formatDate($newsFeed.fetchedAt, $timeFormat, {
            format: $timestampFormat,
            hourFormat: $hourFormat,
          }),
        })
      : translate('common.news-feed-not-fetched'),
  );

  $effect(() => {
    if (
      open &&
      $newsFeed.serverTime &&
      $newsFeed.lastSeenServerTime !== $newsFeed.serverTime
    ) {
      newsFeed.markSeen();
    }
  });
</script>

<Modal
  bind:open
  id="news-feed-modal"
  cancelText={translate('common.close')}
  confirmText={translate('common.refresh')}
  hideCancel
  hideConfirm
  large
>
  <h3 slot="title" class="flex items-center gap-2">
    <Icon name="temporal-logo" class="h-8 w-8" />{translate('common.news')}
  </h3>
  <div
    slot="content"
    class="flex max-h-[65vh] min-h-0 flex-col gap-5 overflow-y-auto pr-2"
  >
    {#if $newsFeed.error}
      <div
        class="surface-warning flex items-start gap-2 border border-warning p-3 text-sm"
        role="alert"
      >
        <Icon name="warning" class="mt-0.5" />
        <p>{$newsFeed.error}</p>
      </div>
    {/if}

    {#if $newsFeed.isLoading && !$newsFeed.items.length}
      <div class="flex items-center gap-2 text-sm text-subtle">
        <Icon name="spinner" class="animate-spin" />
        {translate('common.news-feed-loading')}
      </div>
    {:else if $newsFeed.items.length}
      {#each $newsFeed.items as item (item.id)}
        <article class="min-h-fit border-b border-subtle py-2 last:border-b-0">
          <h4>{item.title}</h4>
          <Markdown
            frameId="news-feed-{item.id}"
            fill={false}
            minHeight={0}
            overrideTheme="primary"
            {previewTheme}
            content={item.content}
          />
        </article>
      {/each}
    {:else}
      <p class="text-sm text-subtle">{translate('common.news-feed-empty')}</p>
    {/if}
  </div>

  <div
    slot="footer"
    class="flex w-full flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between"
  >
    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="xs"
        leadingIcon="retry"
        loading={$newsFeed.isLoading}
        on:click={() => newsFeed.refresh({ cache: 'reload' })}
      >
        {translate('common.refresh')}
      </Button>
      <span class="text-subtle">{lastFetchedLabel}</span>
    </div>

    <Checkbox
      id="news-feed-auto-fetch"
      checked={$newsFeed.autoFetchEnabled}
      label={translate('common.news-feed-auto-fetch')}
      on:change={(event) => newsFeed.setAutoFetchEnabled(event.detail.checked)}
    />
  </div>
</Modal>
