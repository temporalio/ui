<script lang="ts">
  import { BROWSER } from 'esm-env';

  import { page } from '$app/stores';

  import type { PageData } from './$types';

  import FeedbackButton from '$lib/components/feedback-button.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { routeForAuthentication } from '$lib/utilities/route-for';
  import Logo from '$lib/vendor/logo.svg';

  export let data: PageData;

  let { settings } = data;
  const error = $page.url.searchParams.get('error');
</script>

<PageTitle title="Login" url={$page.url.href} />
<header class="flex h-16 w-full items-center justify-between bg-primary px-10">
  <img src={Logo} alt="" class="max-h-10" />
  <FeedbackButton />
</header>
<section class="my-[20vh] text-center">
  <h1 class="text-7xl font-semibold sm:text-8xl" data-testid="login-title">
    Welcome back.
  </h1>
  <p class="my-7" data-testid="login-info">Let's get you signed in.</p>
  <div class="flex items-center justify-center">
    <Button
      data-testid="login-button"
      leadingIcon="lock"
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
        class="rounded-md border border-orange-500 bg-orange-100 p-5 text-center"
      >
        {error}
      </p>
    </div>
  {/if}
</section>
