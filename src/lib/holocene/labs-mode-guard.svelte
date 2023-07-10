<script lang="ts">
  import { page } from '$app/stores';
  
  import { labsMode } from '$lib/stores/labs-mode';
  $: labsModeParamOn = $page.url.searchParams.get('labs') === 'true';
  $: labsModeParamOff = $page.url.searchParams.get('labs') === 'false';

  $: {
    if (labsModeParamOn) {
      $labsMode = true;
    } else if (labsModeParamOff) {
      $labsMode = false;
    }
  }
</script>

{#if $labsMode}
  <slot />
{/if}
