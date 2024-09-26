<script lang="ts">
  import { page } from '$app/stores';

  $: nexusEnabled = $page.data?.systemInfo?.capabilities?.nexus;
</script>

{#if nexusEnabled}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
