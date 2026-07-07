<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { createNewsFeedStore } from '$lib/stores/news-feed';
  import type { NewsFeedSource } from '$lib/types/news-feed';

  import NewsFeedModal from './news-feed-modal.svelte';

  interface Props {
    clusterId: string;
    source: NewsFeedSource;
    class?: string;
    previewTheme?: 'dark' | 'light';
    variant?: 'button' | 'navigation';
  }

  let {
    clusterId,
    source,
    class: className = '',
    previewTheme,
    variant = 'button',
  }: Props = $props();

  const newsFeed = $derived(createNewsFeedStore({ clusterId, source }));
  let open = $state(false);

  $effect(() => {
    newsFeed.initialize();
    return () => newsFeed.destroy();
  });

  const unread = $derived($newsFeed.hasUnread);
  const label = $derived(
    translate(
      unread ? 'common.news-feed-open-unread' : 'common.news-feed-open',
    ),
  );

  const openNewsFeed = () => {
    open = true;
    newsFeed.markSeen();
  };
</script>

{#if variant === 'navigation'}
  <NavigationButton
    onClick={openNewsFeed}
    tooltip={label}
    label={translate('common.news')}
    icon={unread ? 'megaphone-unread' : 'megaphone'}
    data-testid="news-feed-trigger"
    class={className}
  />
{:else}
  <Button
    variant="ghost"
    leadingIcon={unread ? 'megaphone-unread' : 'megaphone'}
    aria-label={label}
    class={className}
    data-testid="news-feed-trigger"
    on:click={openNewsFeed}
  />
{/if}

<NewsFeedModal bind:open {newsFeed} {previewTheme} />
