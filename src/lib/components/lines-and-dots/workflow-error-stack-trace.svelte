<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Failure } from '$lib/types';

  export let failure: Failure | undefined = undefined;
</script>

{#if failure}
  <Accordion title={translate('common.failure')} class="text-sm">
    <div class="hidden w-full text-right text-xs lg:block" slot="description">
      {failure?.message}
    </div>
    <div class="flex flex-col gap-2">
      <p>{translate('common.message')}</p>
      <CodeBlock
        content={failure?.message || ''}
        language="text"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
      {#if failure?.source}
        <p>{translate('common.source')}</p>
        <CodeBlock
          content={failure.source}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
      {#if failure?.stackTrace}
        <p>{translate('common.stack-trace')}</p>
        <CodeBlock
          content={failure.stackTrace}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
    </div>
  </Accordion>
{/if}
{#if failure?.cause}
  <svelte:self failure={failure.cause} />
{/if}
