<script lang="ts">
  import { BROWSER } from 'esm-env';

  import Link from '$lib/holocene/link.svelte';
  import type { NetworkError } from '$lib/types/global';
  import { has } from '$lib/utilities/has';

  import CodeBlock from './code-block.svelte';

  const reload = () => {
    if (BROWSER) {
      window.location.reload();
    }
  };

  let {
    reset = reload,
    error,
    status = 500,
  }: {
    reset?: () => void;
    error: App.Error | NetworkError | unknown;
    status?: number;
  } = $props();

  let message = $state(
    has(error, 'message') && typeof error.message === 'string'
      ? error.message
      : '',
  );

  if (has(error, 'statusCode')) {
    status = error.statusCode as number;
  }
</script>

<section
  aria-roledescription="error"
  class="flex w-full flex-col items-center justify-center gap-4 border-2 border-danger bg-danger px-24 py-12"
  role="alert"
>
  <h1 class="text-[12rem] font-semibold leading-none">{status}</h1>
  <p class="text-lg">Uh oh. There's an error.</p>
  <div class="w-full">
    <CodeBlock content={message} language="text" />
  </div>
  <p class="text-lg">
    <button class="underline hover:text-blue-700" tabindex={0} onclick={reset}
      >Try a refresh</button
    >
    or
    <Link newTab href="https://temporal.io/slack" class="text-black"
      >jump on our Slack Channel</Link
    >.
  </p>
</section>
