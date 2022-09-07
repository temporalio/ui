<script>
  import { publicPath } from '$lib/utilities/get-public-path';

  export let title = 'Temporal';
  export let url = 'https://temporal.io';

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
