<script>
  export let title = 'Temporal';
  export let url = 'https://temporal.io';
  export let image = '/banner.png';
</script>

<svelte:head>
  <title>{title}</title>

  <link rel="manifest" href="/site.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:title" content={title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
</svelte:head>
