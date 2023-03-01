<script lang="ts">
  import type { PageData } from './$types';
  import { updated } from '$app/stores';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { goto } from '$app/navigation';
  import { routeForLoginPage } from '$lib/utilities/route-for';

  import SideNavigation from './_side-nav.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/holocene/error-boundary';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import { toaster } from '$lib/stores/toaster';
  import TopNavigation from '$lib/components/top-nav.svelte';

  export let data: PageData;

  $: ({ uiVersionInfo } = data);

  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };

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
    <SideNavigation />
  </div>
  <main id="content" class="min-h-screen w-max flex-auto bg-gray-100 -mt-4">
    <TopNavigation {logout} />
    <Banners {uiVersionInfo} />
    <div class="z-10 flex flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
    <ScrollToTop />
  </main>
</div>
