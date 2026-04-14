<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  let { value }: { value: string } = $props();

  const jsonValue = $derived.by(() => {
    try {
      return parseWithBigInt(value);
    } catch {
      return null;
    }
  });

  const isLLMMetadata = $derived.by(() => {
    if (jsonValue && typeof jsonValue === 'object' && '_llm' in jsonValue) {
      return true;
    }
    return false;
  });

  const llm = $derived(jsonValue?._llm);
  const model = $derived(llm?.model);
  const provider = $derived(llm?.provider);
  const cost = $derived(llm?.cost);
  const inputTokens = $derived(llm?.inputTokens);
  const outputTokens = $derived(llm?.outputTokens);
  const totalTokens = $derived(llm?.totalTokens);

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

{#if isLLMMetadata}
  <div class="surface-primary overflow-hidden">
    <div class="flex flex-col gap-1 p-2">
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

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {@render Info('Cost', formatCost(cost))}
        {@render Info('Input Tokens', formatNumber(inputTokens))}
        {@render Info('Output Tokens', formatNumber(outputTokens))}
        {@render Info('Total Tokens', formatNumber(totalTokens))}
      </div>
    </div>
  </div>
{/if}
