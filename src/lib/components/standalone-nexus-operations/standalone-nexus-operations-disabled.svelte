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

  const configValues = `nexus.enableStandaloneOperations:
  - value: true`;

  const configValuesPerNamespace = $derived(`nexus.enableStandaloneOperations:
  - value: true
    constraints:
      namespace: ${namespace}`);
</script>

<PageTitle
  title="{translate(
    'standalone-nexus-operations.standalone-nexus-operations',
  )} | {namespace}"
  url={href}
/>

<h1>Standalone Nexus Operations</h1>
<Alert
  title={translate(
    'standalone-nexus-operations.standalone-nexus-operations-disabled',
  )}
  intent="info"
  class="max-w-4xl"
/>
<div class="flex max-w-4xl flex-col gap-2">
  <p>
    {translate(
      'standalone-nexus-operations.standalone-nexus-operations-enablement',
    )}
  </p>
  <CodeBlock copyable content={configValues} />
  <p>
    {translate(
      'standalone-nexus-operations.standalone-nexus-operations-enablement-per-namespace',
    )}
  </p>
  <CodeBlock copyable content={configValuesPerNamespace} />
</div>
