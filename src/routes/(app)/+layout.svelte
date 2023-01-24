<script lang="ts">
  import type { PageData } from './$types';
  import { updated } from '$app/stores';
  import Header from './_header.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/holocene/error-boundary';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import { toaster } from '$lib/stores/toaster';

  export let data: PageData;

  $: ({ user, uiVersionInfo } = data);

  updated.subscribe(async (value) => {
    if (value) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });
</script>

<div class="flex w-screen flex-row">
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <Header {user} />
  </div>
  <main
    id="content"
    class="min-h-screen w-max flex-auto overflow-auto bg-gray-100"
  >
    <Banners {uiVersionInfo} />
    <div class="z-10 flex flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
    <ScrollToTop />
  </main>
</div>
