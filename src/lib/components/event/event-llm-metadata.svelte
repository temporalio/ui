<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  let { value }: { value: string } = $props();

  type LLMMetadata = {
    model?: string;
    provider?: string;
    promptTokens?: number | string;
    completionTokens?: number | string;
    totalTokens?: number | string;
    cost?: number | string;
    score?: number | string;
    traceUrl?: string;
    latencyMs?: number | string;
    status?: string;
    statusDetail?: string;
    costCurrency?: string;
    streaming?: boolean;
    timeToFirstTokenMs?: number | string;
    promptKey?: string;
    responseKey?: string;
  };

  const jsonValue = $derived.by(() => {
    try {
      return parseWithBigInt(value);
    } catch {
      return null;
    }
  });

  const llm: LLMMetadata | null = $derived(jsonValue?._details);
  const model = $derived(llm?.model);
  const provider = $derived(llm?.provider);
  const cost = $derived(llm?.cost);
  const promptTokens = $derived(llm?.promptTokens);
  const completionTokens = $derived(llm?.completionTokens);
  const totalTokens = $derived(llm?.totalTokens);
  const responseKey = $derived(llm?.responseKey ?? 'result');

  const formatNumber = (n: unknown): string => {
    if (n == null) return '--';
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString();
  };

  const formatCost = (c: unknown): string => {
    if (c == null) return '--';
    const num = Number(c);
    if (isNaN(num)) return String(c);
    return `$${num.toFixed(4)}`;
  };
</script>

{#snippet Info(key: string, value: string)}
  {#if value !== null && value !== undefined}
    <div class="surface-primary rounded py-2">
      <p class="text-xs font-medium uppercase tracking-wider text-secondary">
        {key}
      </p>
      <p class="text-sm font-semibold tabular-nums text-primary">
        {value}
      </p>
    </div>
  {/if}
{/snippet}

<div class="surface-primary mb-2 overflow-hidden">
  <div class="flex flex-col gap-1">
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {@render Info('Cost', formatCost(cost))}
      {@render Info('Input Tokens', formatNumber(promptTokens))}
      {@render Info('Output Tokens', formatNumber(completionTokens))}
      {@render Info('Total Tokens', formatNumber(totalTokens))}
    </div>
    {#if model || provider}
      <div class="flex flex-wrap items-center gap-2">
        {#if provider}
          <Badge type="default">
            {provider}
          </Badge>
        {/if}
        {#if model}
          <Badge type="secondary">
            {model}
          </Badge>
        {/if}
      </div>
    {/if}
  </div>
</div>
<CodeBlock
  content={jsonValue?.[responseKey]}
  maxHeight={384}
  copyIconTitle={translate('common.copy-icon-title')}
  copySuccessIconTitle={translate('common.copy-success-icon-title')}
/>
