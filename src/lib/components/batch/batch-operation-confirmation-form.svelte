<script lang="ts">
  import type { Snippet } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    reason: string;
    jobId: string;
    jobIdValid: boolean;
    reasonPlaceholder: string;
    jobIdPlaceholder: string;
    reasonInputId: string;
    reasonHint: string;
    allSelected: boolean;
    confirmationText: string;
    allSelectedText?: string;
    countDisclaimerText?: string;
    query?: string;
    queryTestId?: string;
    children?: Snippet;
  }

  let {
    reason = $bindable(),
    jobId = $bindable(),
    jobIdValid = $bindable(),
    reasonPlaceholder,
    jobIdPlaceholder,
    reasonInputId,
    reasonHint,
    allSelected,
    confirmationText,
    allSelectedText = '',
    countDisclaimerText = '',
    query = '',
    queryTestId = 'batch-action-query',
    children,
  }: Props = $props();

  const handleJobIdChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    jobIdValid = /^[\w.~-]*$/.test(target.value);
  };
</script>

<div class="mb-4 flex flex-col gap-4">
  {#if allSelected}
    <p class="mb-2">{allSelectedText}</p>
    <div
      class="surface-subtle mb-2 overflow-scroll whitespace-nowrap border border-subtle p-2"
    >
      <code data-testid={queryTestId}>
        {query}
      </code>
    </div>
    <span class="text-xs">{countDisclaimerText}</span>
  {:else}
    <p>{confirmationText}</p>
  {/if}
  <Input
    id={reasonInputId}
    bind:value={reason}
    label={translate('common.reason')}
    hintText={reasonHint}
    placeholder={reasonPlaceholder}
  />
  <Input
    id="batch-operation-job-id"
    label={translate('common.job-id')}
    hintText={jobIdValid
      ? translate('batch.job-id-input-hint')
      : translate('batch.job-id-input-error')}
    bind:value={jobId}
    placeholder={jobIdPlaceholder}
    oninput={handleJobIdChange}
    valid={jobIdValid}
  />
  {@render children?.()}
</div>
