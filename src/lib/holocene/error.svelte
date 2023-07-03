<script lang="ts">
  import { BROWSER } from 'esm-env';
  import { createEventDispatcher } from 'svelte';
  
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  
  import Link from '$lib/holocene/link.svelte';
  import type { NetworkError } from '$lib/types/global';
  import { has } from '$lib/utilities/has';
  

  export let error: App.Error | NetworkError = null;
  export let status = 500;
  let message = error?.message || '';

  if (has(error, 'statusCode')) {
    status = error.statusCode;
  }

  const dispatch = createEventDispatcher();

  $: currentLocation = $page.url.toString();

  afterNavigate(() => {
    dispatch('clearError', {});
  });
</script>

<section
  aria-roledescription="error"
  class="mt-32 text-center align-middle"
  role="alert"
>
  <h1 class="text-[12rem] font-semibold">{status}</h1>
  <p class="-mt-6 mb-5 text-lg">Uh oh. There's an error.</p>
  <p class="my-4 w-auto text-2xl font-extrabold text-red-700">
    {message}
  </p>

  <p class="text-lg">
    <Link
      href={currentLocation}
      on:click={() => {
        if (BROWSER) {
          window.location.reload();
        }
      }}
      target="_self"
      class="underline underline-offset-2">Try a refresh</Link
    >
    or
    <Link href="https://temporal.io/slack">jump on our Slack Channel</Link>.
  </p>
</section>
