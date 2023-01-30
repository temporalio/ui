<script lang="ts">
  import { page } from '$app/stores';

  export let isCloud = false;
</script>

{#if isCloud || $page.data?.settings?.runtimeEnvironment?.isCloud}
  <slot name="fallback" />
{:else}
  <slot />
{/if}
