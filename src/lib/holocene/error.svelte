<script lang="ts">
  import { BROWSER } from 'esm-env';

  import Link from '$lib/holocene/link.svelte';
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

  let { error, status: statusProp = 500, reset = reload }: Props = $props();

  const message = $derived(has(error, 'message') ? String(error.message) : '');
  const status = $derived(
    has(error, 'statusCode') ? Number(error.statusCode) : statusProp,
  );
</script>

<section
  aria-roledescription="error"
  class="mx-auto mt-16 flex max-w-xl flex-col items-center rounded-panel border border-danger bg-danger/5 px-5 py-8 text-center align-middle"
  role="alert"
>
  <h1 class="font-mono text-5xl font-semibold tracking-tight text-danger">
    {status}
  </h1>
  <p class="mt-2 text-base font-semibold">Uh oh. There's an error.</p>
  <p class="mt-2 w-auto text-sm text-danger">
    {message}
  </p>

  <p class="mt-5 text-sm text-secondary">
    <button
      class="text-brand underline hover:no-underline"
      tabindex={0}
      onclick={reset}>Try a refresh</button
    >
    or
    <Link newTab href="https://temporal.io/slack"
      >jump on our Slack Channel</Link
    >.
  </p>
</section>
