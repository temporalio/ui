<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconMegaphone } from '$lib/io/icon';
  import { createNewsFeedStore } from '$lib/stores/news-feed';
  import type { NewsFeedSource } from '$lib/types/news-feed';

  import MegaphoneUnread from './megaphone-unread.svelte';
  import NewsFeedModal from './news-feed-modal.svelte';

  interface Props {
    clusterId: string;
    source: NewsFeedSource;
    previewTheme?: 'dark' | 'light';
    variant?: 'button' | 'navigation';
  }

  let { clusterId, source, previewTheme, variant = 'button' }: Props = $props();

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
    Icon={unread ? MegaphoneUnread : IconMegaphone}
    data-testid="news-feed-trigger"
  />
{:else}
  <Button
    variant="ghost"
    LeadingIcon={unread ? MegaphoneUnread : IconMegaphone}
    aria-label={label}
    class="h-9 w-9 shrink-0 p-0"
    data-testid="news-feed-trigger"
    size="sm"
    onclick={openNewsFeed}
  />
{/if}

<NewsFeedModal bind:open {newsFeed} {previewTheme} />
