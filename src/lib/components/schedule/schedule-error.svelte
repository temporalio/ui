<script lang="ts">
  import Icon from 'svelte-fa';
  import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

  import Panel from '$lib/components/panel.svelte';

  export let error: string = '';
</script>

<Panel error>
  <p class="error-text">
    <Icon class="inline text-red-900 mr-2" icon={faExclamationTriangle} />Error
    Message
  </p>
  <p class="error-text">
    {error}
  </p>
</Panel>

<style lang="postcss">
  .error-text {
    @apply text-red-900 mb-2 text-base;
  }
</style>
