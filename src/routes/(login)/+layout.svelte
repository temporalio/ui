<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import EnvironmentBanner from '$lib/components/environment-banner.svelte';
  import DarkMode from '$lib/utilities/dark-mode';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let bannerHeight = $state(0);
  const bannerText = $derived(page.data?.settings?.bannerText ?? '');
</script>

<DarkMode />
<div
  class="min-h-screen bg-background-primary pt-[var(--environment-banner-height)] text-primary"
  style:--environment-banner-height={`${bannerText ? bannerHeight : 0}px`}
>
  <EnvironmentBanner text={bannerText} bind:height={bannerHeight} />
  {@render children()}
</div>
