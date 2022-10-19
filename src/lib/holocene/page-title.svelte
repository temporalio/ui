<script>
  import { settings } from '$lib/stores/settings';

  import banner from '$lib/vendor/banner.png';
  import manifest from '$lib/vendor/site.webmanifest';
  import favicon from '$lib/vendor/favicon.ico';
  import apple from '$lib/vendor/apple-touch-icon.png';

  import cloudFavicon from '$lib/vendor/cloud/favicon.ico';
  import cloudApple from '$lib/vendor/cloud/apple-touch-icon.png';
  import cloudManifest from '$lib/vendor/cloud/site.webmanifest';

  export let title = 'Temporal';
  export let url = 'https://temporal.io';

  export let image = banner;

  $: isCloud = $settings?.runtimeEnvironment?.isCloud;
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="icon" href={isCloud ? cloudFavicon : favicon} />
  <link rel="manifest" href={isCloud ? cloudManifest : manifest} />
  <link rel="apple-touch-icon" href={isCloud ? cloudApple : apple} />

  <meta property="og:title" content={title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
</svelte:head>
