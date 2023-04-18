<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { BROWSER } from 'esm-env';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { routeForAuthentication } from '$lib/utilities/route-for';
  import Logo from '$lib/vendor/logo.svg';
  import FeedbackButton from '$lib/components/feedback-button.svelte';

  export let data: PageData;

  let { settings } = data;
  const error = $page.url.searchParams.get('error');
</script>

<PageTitle title="Login" url={$page.url.href} />
<header class="flex h-16 w-full items-center justify-between bg-primary px-10">
  <a href="/" class="inline-block">
    <img src={Logo} alt="Temporal Logo" class="max-h-10" />
  </a>
  <FeedbackButton />
</header>
<section class="my-[20vh] text-center">
  <h1 class="text-8xl font-semibold" data-testid="login-title">
    Welcome back.
  </h1>
  <p class="my-7" data-testid="login-info">Let's get you signed in.</p>
  <div class="mx-auto">
    <Button
      testId="login-button"
      variant="login"
      icon="lock"
      on:click={() => {
        if (BROWSER) {
          window.location.assign(
            routeForAuthentication({
              settings,
              searchParams: $page.url.searchParams,
              originUrl: $page.url.origin,
            }),
          );
        }
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
