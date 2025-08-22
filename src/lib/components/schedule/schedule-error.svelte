<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';

  export let error = '';
</script>

<Alert intent="error">
  <p>{translate('schedules.error-title')}</p>
  <p>
    {error}
  </p>
</Alert>
