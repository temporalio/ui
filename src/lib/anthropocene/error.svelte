<script lang="ts">
  import { BROWSER } from 'esm-env';

  import Link from '$lib/anthropocene/link.svelte';
  import type { NetworkError } from '$lib/types/global';
  import { has } from '$lib/utilities/has';

  const reload = () => {
    if (BROWSER) {
      window.location.reload();
    }
  };

  interface Props {
    error: App.Error | NetworkError | unknown;
    status?: number;
    reset?: () => void;
  }

  let { error, status = 500, reset = reload }: Props = $props();

  let message = has(error, 'message') ? String(error.message) : '';
  if (has(error, 'statusCode')) {
    status = Number(error.statusCode);
  }
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
    <button class="underline hover:text-blue-700" tabindex={0} onclick={reset}
      >Try a refresh</button
    >
    or
    <Link newTab href="https://temporal.io/slack"
      >jump on our Slack Channel</Link
    >.
  </p>
</section>
