<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { translate } from '$lib/i18n/translate';

  export let error = '';
</script>

<Panel error>
  <p class="error-text">{translate('schedules.error-title')}</p>
  <p class="error-text">
    {error}
  </p>
</Panel>

<style lang="postcss">
  @reference "tailwindcss";

  .error-text {
    @apply mb-2 text-base text-red-900;
  }
</style>
