<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let content: string;
  export let inline: boolean;
</script>

<article class="flex w-full flex-col lg:w-1/2" {...$$restProps}>
  {#if content}
    <div class="flex overflow-scroll bg-gray-900">
      <PayloadDecoder value={parseWithBigInt(content)} let:decodedValue>
        {#key inline}
          <CodeBlock
            {inline}
            content={decodedValue}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/key}
      </PayloadDecoder>
    </div>
  {:else}
    <div class="flex overflow-scroll bg-gray-900">
      <CodeBlock
        content="Results will appear upon completion."
        language="text"
        copyable={false}
      />
    </div>
  {/if}
</article>
