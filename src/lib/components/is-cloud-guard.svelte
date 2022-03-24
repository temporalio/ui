<script lang="ts">
  import { page } from '$app/stores';
</script>

{#if !$page.stuff.settings.runtimeEnvironment.isCloud}
  <slot />
{/if}
