<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { ComputeProviderSectionProps } from './types';
  import RegionBlock from '../region-block.svelte';

  let { fields, serverError }: ComputeProviderSectionProps = $props();
</script>

<!-- Headed for the provider rather than a region: a Modal Function is reached
by App and Function, and the Namespace region the controller runs in is not a
choice this form offers. No failover strip, for the same reason. -->
<RegionBlock title={translate('workers.provider-modal')}>
  {#if serverError}
    <Alert
      intent="error"
      title={translate('common.error-occurred')}
      class="mb-4"
    >
      {serverError}
    </Alert>
  {/if}
  {@render fields()}
</RegionBlock>
