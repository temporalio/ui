<script lang="ts">
  import { BROWSER } from 'esm-env';

  import Link from '$lib/holocene/link.svelte';
  import type { NetworkError } from '$lib/types/global';
  import { has } from '$lib/utilities/has';
  import CodeBlock from './code-block.svelte';

  export let error: App.Error | NetworkError = null;
  export let status = 500;
  let message = error?.message || '';

  if (has(error, 'statusCode')) {
    status = error.statusCode;
  }
</script>

<section
  aria-roledescription="error"
  class="flex flex-col items-center justify-center gap-4 border-2 border-danger bg-danger px-24 py-12"
  role="alert"
>
  <h1 class="text-[12rem] font-semibold leading-none">{status}</h1>
  <p class="text-lg">Uh oh. There's an error.</p>
  <CodeBlock content={message} language="text" />
  <p class="text-lg">
    <button
      class="underline hover:text-blue-700"
      tabindex={0}
      on:click={() => {
        if (BROWSER) {
          window.location.reload();
        }
      }}>Try a refresh</button
    >
    or
    <Link newTab href="https://temporal.io/slack" class="text-black"
      >jump on our Slack Channel</Link
    >.
  </p>
</section>
