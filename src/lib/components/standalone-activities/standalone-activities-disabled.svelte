<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';

  import PageTitle from '../page-title.svelte';

  interface Props {
    namespace: string;
    href: string;
  }

  let { namespace, href }: Props = $props();

  const configValues = `history.enableTransitionHistory:
  - value: true
history.enableChasm:
  - value: true
activity.enableStandalone:
  - value: true`;

  const configValuesPerNamespace = $derived(`activity.enableStandalone:
  - value: true
    constraints:
      namespace: ${namespace}`);
</script>

<PageTitle
  title="{translate(
    'standalone-activities.standalone-activities',
  )} | {namespace}"
  url={href}
/>

<h1>Standalone Activities</h1>
<Alert
  title={translate('standalone-activities.standalone-activities-disabled')}
  intent="info"
/>
<div class="flex max-w-4xl flex-col gap-2">
  <p>{translate('standalone-activities.standalone-activities-enablement')}</p>
  <CodeBlock copyable content={configValues} />
  <p>
    {translate(
      'standalone-activities.standalone-activities-enablement-per-namespace',
    )}
  </p>
  <CodeBlock copyable content={configValuesPerNamespace} />
</div>
