<script lang="ts">
  import { updated } from '$app/stores';
  import Header from '../../_header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';

  import type { PageData } from './$types';

  export let data: PageData;
  let { user, uiVersionInfo } = data;
  $: ({ user, uiVersionInfo } = data);

  updated.subscribe(async (value) => {
    if (value) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });
</script>

<div class="flex w-screen flex-row">
  <Notifications />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <Header {user} />
  </div>
  <section id="content" class="min-h-screen w-max flex-auto overflow-auto">
    <Banners {uiVersionInfo} />
    <div class="z-10 flex flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
    <ScrollToTop />
  </section>
</div>
