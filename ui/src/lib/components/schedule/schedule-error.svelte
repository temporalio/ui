<script lang="ts">
  import Panel from '$lib/components/panel.svelte';

  export let error: string = '';
</script>

<Panel error>
  <p class="error-text">Error Message</p>
  <p class="error-text">
    {error}
  </p>
</Panel>

<style lang="postcss">
  .error-text {
    @apply mb-2 text-base text-red-900;
  }
</style>
