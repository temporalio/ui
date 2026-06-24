<script lang="ts">
  import { onMount } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { createNewsFeedStore } from '$lib/stores/news-feed';

  import NewsFeedModal from './news-feed-modal.svelte';

  interface Props {
    clusterId: string;
  }

  let { clusterId }: Props = $props();

  const newsFeed = $derived(createNewsFeedStore({ clusterId }));
  let open = $state(false);

  onMount(() => {
    newsFeed.initialize();

    return () => newsFeed.destroy();
  });

  const unread = $derived($newsFeed.hasUnread);

  const openNewsFeed = () => {
    open = true;
    newsFeed.markSeen();
  };
</script>

<Button
  variant="ghost"
  leadingIcon={unread ? 'megaphone-unread' : 'megaphone'}
  data-testid="news-feed-trigger"
  on:click={openNewsFeed}
/>

<NewsFeedModal bind:open {newsFeed} />
