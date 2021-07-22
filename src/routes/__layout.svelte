<script>
  import '../app.postcss';
  import Navigation from './_navigation.svelte';
</script>

<svelte:head>
  <title>Temporal</title>

  <link rel="manifest" href="site.webmanifest" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />

  <meta property="og:title" content="Temporal" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
  <meta property="og:image" content="/banner.png" />
</svelte:head>

<main class="flex align-start">
  <Navigation />
  <div class="w-full">
    <slot />
  </div>
</main>

<slot />
