<script lang="ts">
  import Header from './_import-header.svelte';
  import { ErrorBoundary } from '$lib/holocene/error-boundary';
  import Toaster from '$holocene/toaster.svelte';
  import { toaster } from '$lib/stores/toaster';
</script>

<svelte:head>
  <title>Temporal</title>
  <meta property="og:title" content="Temporal" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
</svelte:head>

<div class="flex h-screen w-screen flex-row">
  <Toaster toasts={toaster.toasts} pop={toaster.pop} />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <Header />
  </div>
  <section id="content" class="h-screen w-max flex-auto overflow-auto">
    <div class="z-10 flex h-full flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</div>
