<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';

  interface Props {
    workflow: WorkflowExecution;
    next?: string;
  }
  let { workflow }: Props = $props();

  const searchAttributes = $derived(workflow?.searchAttributes?.indexedFields);
  const modelsAndProviders = $derived(searchAttributes?.ModelsAndProviders);
  const models = $derived(
    modelsAndProviders
      ?.filter((mp) => mp.includes('model:'))
      ?.map((mp) => mp.replace('model:', '')),
  );
  const providers = $derived(
    modelsAndProviders
      ?.filter((mp) => mp.includes('provider:'))
      ?.map((mp) => mp.replace('provider:', '')),
  );
  const cost = $derived(searchAttributes?.TotalCost);
  const promptTokens = $derived(searchAttributes?.PromptTokens);
  const completionTokens = $derived(searchAttributes?.CompletionTokens);
  const totalTokens = $derived(searchAttributes?.TotalTokens);

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
    <div class="py-2">
      <p class="text-xs font-medium uppercase tracking-wider text-secondary">
        {key}
      </p>
      <p class="text-sm font-semibold tabular-nums text-primary">
        {value}
      </p>
    </div>
  {/if}
{/snippet}

{#if totalTokens}
  <div class="overflow-hidden px-2">
    <p class="flex items-center gap-2 font-medium text-secondary">
      <Icon name="robot" /> LLM Details
    </p>
    <div class="flex flex-col gap-1">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-6">
        <div class="py-2">
          <p
            class="text-xs font-medium uppercase tracking-wider text-secondary"
          >
            Models
          </p>
          <div class="flex flex-wrap items-center gap-2">
            {#each models as model}
              <Badge type="secondary">
                {model}
              </Badge>
            {/each}
          </div>
        </div>
        <div class="py-2">
          <p
            class="text-xs font-medium uppercase tracking-wider text-secondary"
          >
            Providers
          </p>
          <div class="flex flex-wrap items-center gap-2">
            {#each providers as provider}
              <Badge type="default">
                {provider}
              </Badge>
            {/each}
          </div>
        </div>
        {@render Info('Cost', formatCost(cost))}
        {@render Info('Input Tokens', formatNumber(promptTokens))}
        {@render Info('Output Tokens', formatNumber(completionTokens))}
        {@render Info('Total Tokens', formatNumber(totalTokens))}
      </div>
    </div>
  </div>
{/if}
