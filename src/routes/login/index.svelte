<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/components/button.svelte';
  import { getLoginUrl } from '$lib/utilities/get-login-url';
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
  export let settings: Settings;
</script>

<header
  class="grid grid-rows-1 grid-cols-12 px-10 items-center bg-gray-900 shadow-lg gap-6"
>
  <a href="/" class="flex my-4 max-h-8">
    <img src="/logo.svg" alt="Temporal Logo" class="max-h-8" />
  </a>
</header>

<section class="text-center my-[20vh]">
  <h1 class="text-8xl font-semibold">Welcome back.</h1>
  <p class="my-7">Lets get you signed in.</p>
  <div class="mx-auto">
    <Button
      classes=""
      login
      icon={faLock}
      on:click={() => {
        goto(getLoginUrl(settings, $page.url.searchParams));
      }}>Continue to SSO</Button
    >
  </div>
</section>
