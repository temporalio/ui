<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$holocene/button.svelte';
  import { routeForAuthentication } from '$lib/utilities/route-for';
  import { fetchSettings } from '$lib/services/settings-service';

  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ fetch }) {
    const settings: Settings = await fetchSettings(fetch);

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
  import { publicPath } from '$lib/utilities/get-public-path';

  const error = $page.url.searchParams.get('error');

  export let settings: Settings;
</script>

<NavigationHeader href="{publicPath}/" user={undefined} />
<HamburgerHeader href="{publicPath}/" user={undefined} />
<section class="my-[20vh] text-center">
  <h1 class="text-8xl font-semibold" data-cy="login-title">Welcome back.</h1>
  <p class="my-7" data-cy="login-info">Let's get you signed in.</p>
  <div class="mx-auto">
    <Button
      dataCy="login-button"
      variant="login"
      icon="lock"
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

  {#if error}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
      <p
        class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
      >
        {error}
      </p>
    </div>
  {/if}
</section>
