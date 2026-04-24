<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  export let includesTaskQueueType: boolean;
</script>

<Icon
  name={includesTaskQueueType ? 'checkmark' : 'close'}
  class={includesTaskQueueType ? 'text-blue-700' : 'text-primary'}
  title={includesTaskQueueType
    ? translate('common.yes')
    : translate('common.no')}
/>
