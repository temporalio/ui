<script lang="ts">
  import { BROWSER } from 'esm-env';

  import { page } from '$app/state';

  import type { PageData } from './$types';

  import FeedbackButton from '$lib/components/feedback-button.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { routeForAuthentication } from '$lib/utilities/route-for';
  import Logo from '$lib/vendor/logo.svg';

  let { data }: { data: PageData } = $props();

  const error = $derived(page.url.searchParams.get('error'));
</script>

<PageTitle title="Login" url={page.url.href} />
<header
  class="surface-primary flex h-12 w-full items-center justify-between border-b border-subtle px-[var(--page-gutter)]"
>
  <img src={Logo} alt="" class="max-h-7" />
  <FeedbackButton />
</header>
<section class="mx-auto my-[16vh] max-w-lg px-4 text-center">
  <h1
    class="text-3xl font-semibold tracking-tight sm:text-4xl"
    data-testid="login-title"
  >
    Welcome back.
  </h1>
  <p class="mb-6 mt-2 text-secondary" data-testid="login-info">
    Let's get you signed in.
  </p>
  <div class="flex items-center justify-center">
    <Button
      data-testid="login-button"
      leadingIcon="lock"
      onclick={() => {
        if (BROWSER) {
          window.location.assign(
            routeForAuthentication({
              settings: data.settings,
              searchParams: page.url.searchParams,
              originUrl: page.url.origin,
            }),
          );
        }
      }}>Continue to SSO</Button
    >
  </div>

  {#if error}
    <div class="my-6 flex flex-col items-center justify-start gap-2">
      <p
        class="w-full rounded-panel border border-warning bg-warning p-3 text-center text-warning"
      >
        {error}
      </p>
    </div>
  {/if}
</section>
