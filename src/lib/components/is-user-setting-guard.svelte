<script lang="ts">
  import { userSettings } from '$lib/stores/user-settings';

  export let option;

  $: settingEnabled = $userSettings[option] !== false;
</script>

{#if settingEnabled}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
