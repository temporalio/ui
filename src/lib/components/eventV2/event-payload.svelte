<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import { getCodeBlockValue } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let expanded = false;
</script>

{#if typeof value === 'object' && !expanded}
  <div class="flex w-full flex-wrap items-center pr-1 xl:flex-nowrap xl:gap-4">
    <CodeBlock content={getCodeBlockValue(value)} inline />
  </div>
{/if}
