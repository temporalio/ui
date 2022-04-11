<script lang="ts">
  import { browser, dev } from '$app/env';
  import { page } from '$app/stores';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { createEventDispatcher } from 'svelte';
  import { beforeNavigate, goto } from '$app/navigation';

  export let error: globalThis.Error = null;
  export let status = 500;

  if (isNetworkError(error)) {
    status = error.statusCode;
  }

  const dispatch = createEventDispatcher();

  $: currentLocation = $page.url.toString();

  beforeNavigate(() => {
    dispatch('clearError', {});
  });
</script>

<section aria-roledescription="error" class="text-center align-middle mt-32">
  <h1 class="text-[12rem] font-semibold ">{status}</h1>
  <p class="-mt-6 mb-5 text-lg">Uh oh. There's an error.</p>
  <p class="text-lg">
    <a
      href={currentLocation}
      on:click={() => {
        if (browser) {
          window.location.reload();
        }
      }}
      target="_self"
      class="underline-offset-2 underline">Try a refresh</a
    >
    or
    <a href="https://temporal.io/slack" class="underline-offset-2 underline"
      >jump on our Slack Channel</a
    >.
  </p>
</section>

{#if dev}
  <pre class="trace">
    {error?.stack ?? ''}
  </pre>
{/if}

<style>
  .trace {
    font-family: monospace;
  }
</style>
