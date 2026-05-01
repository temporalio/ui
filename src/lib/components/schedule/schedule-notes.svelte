<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  let { notes = '' }: { notes?: string } = $props();
</script>

<div>
  <h2 class="mb-4">{translate('common.notes')}</h2>
  <p>{notes}</p>
</div>
