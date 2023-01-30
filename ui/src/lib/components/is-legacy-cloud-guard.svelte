<script lang="ts">
  import { page } from '$app/stores';
  import { isCloudMatch } from '$lib/services/settings-service';
  import { browser } from '$lib/svelte-mocks/app/environment';

  export let isCloud = true;
  $: isLegacyCloud = isCloudMatch.test(browser ? $page.url.hostname : '');
</script>

{#if isCloud && isLegacyCloud}
  <slot name="fallback" />
{:else}
  <slot />
{/if}
