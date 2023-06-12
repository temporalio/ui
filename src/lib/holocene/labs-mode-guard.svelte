<script lang="ts">
  import { page } from '$app/stores';

  $: labsModeOn = $page.url.searchParams.get('labsMode') === 'true';
</script>

{#if labsModeOn}
  <slot name="labsMode" />
{:else}
  <slot />
{/if}
