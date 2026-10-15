<script lang="ts">
  import { page } from '$app/state';

  import { statusFavicon } from '$lib/stores/favicon';
  import apple from '$lib/vendor/apple-touch-icon.png';
  import banner from '$lib/vendor/banner.png';
  import favicon from '$lib/vendor/favicon.ico';
  import manifest from '$lib/vendor/site.webmanifest';

  interface Props {
    title?: string;
    url?: string;
    image?: string;
  }

  let {
    title = 'Temporal',
    url = 'https://temporal.io',
    image = banner,
  }: Props = $props();

  const bannerText = $derived(page.data?.settings?.bannerText);
  const pageTitle = $derived(bannerText ? `${bannerText} | ${title}` : title);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <link rel="icon" href={$statusFavicon ?? favicon} />
  <link rel="manifest" href={manifest} />
  <link rel="apple-touch-icon" href={apple} />

  <meta property="og:title" content={pageTitle} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
</svelte:head>
