<script lang="ts">
  import { page } from '$app/stores';

  import Banner from '$lib/holocene/banner/banner.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { lastUsedNamespace } from '$lib/stores/namespaces';

  $: namespace = $page.params?.namespace ?? $lastUsedNamespace;
  $: pathNameSplit = $page.url.pathname.split('/');
  $: showNamespaceSpecificNav =
    namespace &&
    (pathNameSplit.includes('workflows') ||
      pathNameSplit.includes('schedules') ||
      pathNameSplit.includes('batch-operations') ||
      pathNameSplit.includes('task-queues') ||
      pathNameSplit.includes('import'));
</script>

{#if $dataEncoder.hasError && showNamespaceSpecificNav}
  <Banner
    message={translate('data-encoder.codec-server-error')}
    id="transcoder-error"
    icon="transcoder-error"
    type="danger"
  />
{:else}
  <slot name="fallback" />
{/if}
