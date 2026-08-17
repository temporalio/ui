<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Failure } from '$lib/types';

  import { formatWorkflowFailureDiagnostic } from './workflow-failure-diagnostic';

  interface Props {
    failure?: Failure | undefined;
  }

  let { failure = undefined }: Props = $props();

  let diagnostic = $derived(formatWorkflowFailureDiagnostic(failure));
</script>

{#if diagnostic.transcript}
  <div>
    <h3 class="mb-2 text-xs font-medium text-secondary">
      {translate('common.failure-diagnostic')}
    </h3>
    <CodeBlock
      content={diagnostic.transcript}
      label={translate('common.failure-diagnostic')}
      language="text"
      maxHeight={384}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      testId="workflow-task-failure-diagnostic"
    />
  </div>
{/if}
