<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { downloadJson } from '$lib/utilities/download-json';

  interface Props {
    items: unknown[];
    page: number;
    filePrefix: string;
    dataKey?: string;
    testId?: string;
  }

  let {
    items,
    page,
    filePrefix,
    dataKey = filePrefix,
    testId = 'download-json-button',
  }: Props = $props();

  const onClick = () => {
    const fileName = `${filePrefix}-${items.length}-${page}-${Date.now()}.json`;
    downloadJson({ [dataKey]: items }, fileName);
  };
</script>

<Tooltip text={translate('common.download-json')} top>
  <Button
    on:click={onClick}
    data-testid={testId}
    size="xs"
    variant="ghost"
    aria-label={translate('common.download-json')}
  >
    <Icon name="download" />
  </Button>
</Tooltip>
