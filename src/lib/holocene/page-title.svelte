<script>
  export let title = 'Temporal';
  export let url = 'https://temporal.io';

  const publicPath = import.meta.env.VITE_PUBLIC_PATH || '';

  export let image = `${publicPath}/banner.png`;
</script>

<svelte:head>
  <title>{title}</title>

  <link rel="manifest" href="{publicPath}/site.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:title" content={title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
</svelte:head>
