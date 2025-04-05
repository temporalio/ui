<script lang="ts">
  import { page } from '$app/stores';

  export let isCloud = false;
</script>

{#if isCloud || $page.data?.settings?.runtimeEnvironment?.isCloud}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
