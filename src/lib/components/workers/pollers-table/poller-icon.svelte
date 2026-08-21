<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconCheckmark, IconClose } from '$lib/io/icon';

  let { includesTaskQueueType }: { includesTaskQueueType: boolean } = $props();

  const Glyph = $derived(includesTaskQueueType ? IconCheckmark : IconClose);
</script>

<Glyph
  class={includesTaskQueueType ? 'text-blue-700' : 'text-primary'}
  title={includesTaskQueueType
    ? translate('common.yes')
    : translate('common.no')}
/>
