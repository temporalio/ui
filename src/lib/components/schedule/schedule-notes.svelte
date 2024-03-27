<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  export let notes = '';
</script>

<div>
  <h2 class="mb-4 text-lg">{translate('common.notes')}</h2>
  <p>{notes}</p>
</div>
