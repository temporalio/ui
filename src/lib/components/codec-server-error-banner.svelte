<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';

  $: message =
    $dataEncoder.customErrorMessage ||
    translate('data-encoder.codec-server-error');
  $: linkUrl =
    $dataEncoder.customErrorLink ||
    'https://docs.temporal.io/production-deployment/data-encryption#set-your-codec-server-endpoints';
</script>

{#if $dataEncoder.hasError}
  <Alert intent="error" icon="transcoder-error">
    <div class="flex items-center gap-2">
      <p>{message}</p>
      <Link href={linkUrl} newTab>{linkUrl}</Link>
    </div>
  </Alert>
{/if}
