<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    provider?: string;
    class?: string;
  }

  let { provider, class: className = '' }: Props = $props();

  const knownIssuesHref =
    'https://cloud.google.com/run/docs/known-issues#deployment-latency';
</script>

{#if provider === 'cloud-run'}
  <Alert
    intent="warning"
    class={className}
    title={translate('workers.cloud-run-latency-notice-title')}
    data-testid="cloud-run-latency-notice"
  >
    {translate('workers.cloud-run-latency-notice-before')}<Link
      href={knownIssuesHref}
      newTab>{translate('workers.cloud-run-latency-notice-link')}</Link
    >{translate('workers.cloud-run-latency-notice-after')}
  </Alert>
{/if}
