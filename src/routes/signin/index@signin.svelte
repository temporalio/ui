<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/components/button.svelte';
  import { routeForAuthentication } from '$lib/utilities/route-for';
  import { faLock } from '@fortawesome/free-solid-svg-icons';

  import { fetchSettings } from '$lib/services/settings-service';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ url }) {
    const settings: Settings = await fetchSettings({ url });

    if (!settings.auth.enabled) {
      return {
        status: 404,
      };
    }

    return {
      props: { settings },
      stuff: { settings },
    };
  };
</script>

<script lang="ts">
  import NavigationHeader from '$lib/components/navigation-header.svelte';
  import HamburgerHeader from '$lib/components/hamburger-header.svelte';

  export let settings: Settings;
</script>

<NavigationHeader href="/" user={undefined} />
<HamburgerHeader href="/" user={undefined} />
<section class="text-center my-[20vh]">
  <h1 class="text-8xl font-semibold">Welcome back.</h1>
  <p class="my-7">Let's get you signed in.</p>
  <div class="mx-auto">
    <Button
      classes=""
      login
      icon={faLock}
      on:click={() => {
        goto(
          routeForAuthentication({
            settings,
            searchParams: $page.url.searchParams,
            originUrl: $page.url.origin,
          }),
        );
      }}>Continue to SSO</Button
    >
  </div>
</section>
