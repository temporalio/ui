<script lang="ts">
  import { BROWSER } from 'esm-env';

  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Particles from '$lib/holocene/particles.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowLeft } from '$lib/io/icon';
  import type { NetworkError } from '$lib/types/global';
  import { getErrorKind } from '$lib/utilities/error-presentation';
  import { has } from '$lib/utilities/has';
  import { routeForNamespaces } from '$lib/utilities/route-for';

  const reload = () => {
    if (BROWSER) {
      window.location.reload();
    }
  };

  const goBack = () => {
    if (history.length > 1) {
      history.back();
    } else {
      goto(routeForNamespaces());
    }
  };

  interface Props {
    error: App.Error | NetworkError | unknown;
    status?: number;
    resource?: string;
    back?: { href: string; label: string };
    namespaced?: boolean;
    reset?: () => void;
  }

  let {
    error,
    status: statusProp,
    resource,
    back,
    namespaced = true,
    reset = reload,
  }: Props = $props();

  const message = $derived(
    has(error, 'message') && error.message ? String(error.message) : undefined,
  );
  const status = $derived(
    has(error, 'statusCode') ? Number(error.statusCode) : statusProp,
  );
  const kind = $derived(getErrorKind(status));
  const copy = $derived(
    kind !== 'not-found' || !resource
      ? kind
      : namespaced
        ? 'not-found-resource'
        : 'not-found-unscoped-resource',
  );
  const path = BROWSER ? window.location.pathname + window.location.search : '';
  const time = new Date().toISOString();
  const details = $derived(
    JSON.stringify({ status, message, path, time }, null, 2),
  );
</script>

<section
  class="relative isolate min-h-dvh overflow-hidden bg-background-primary px-4 pt-32 text-center"
>
  <Particles class="absolute inset-0 -z-10 size-full text-secondary" />
  <h1 class="text-3xl font-semibold">
    {translate(`errors.${copy}-title`, { resource })}
  </h1>
  <p class="mx-auto mt-2 max-w-xl text-lg">
    {translate(`errors.${copy}-description`, { resource })}
  </p>

  {#if kind === 'bad-request' || kind === 'not-found'}
    <div class="mt-6 flex items-center justify-center gap-4">
      {#if back}
        <Button LeadingIcon={IconArrowLeft} href={back.href}>
          {back.label}
        </Button>
      {:else}
        <Button LeadingIcon={IconArrowLeft} onclick={goBack}>
          {translate('errors.go-back')}
        </Button>
      {/if}
      {#if kind === 'not-found' && namespaced}
        <Link href={routeForNamespaces()}>
          {translate('errors.view-namespaces')}
        </Link>
      {:else if kind === 'bad-request'}
        <Link newTab href="https://temporal.io/slack">
          {translate('errors.ask-on-slack')}
        </Link>
      {/if}
    </div>
  {:else}
    <p class="mt-4 text-lg">
      <button class="underline hover:text-brand" tabindex={0} onclick={reset}
        >Try a refresh</button
      >
      or
      <Link newTab href="https://temporal.io/slack"
        >jump on our Slack Channel</Link
      >.
    </p>
  {/if}

  <div class="mx-auto mt-8 max-w-xl text-left">
    <h2 class="mb-2 text-sm font-medium text-secondary">
      {translate('errors.technical-details')}
    </h2>
    <div class="rounded backdrop-blur-sm">
      <CodeBlock content={details} />
    </div>
  </div>
</section>
