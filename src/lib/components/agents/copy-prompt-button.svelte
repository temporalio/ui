<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { IconCheckmark, IconCopy } from '$lib/io/icon';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  let {
    label,
    prompt,
    title,
  }: { label: string; prompt: string; title: string } = $props();

  const { copy, copied } = copyToClipboard();
</script>

<span class="inline-flex min-w-0 max-w-full rounded bg-surface-primary">
  <Button
    class="h-auto min-h-9 min-w-0 max-w-full whitespace-normal text-left"
    variant="secondary"
    size="sm"
    aria-label={$copied ? label + ', copied' : undefined}
    title={$copied ? 'Copied' : title}
    onclick={(event) => copy(event, prompt)}
  >
    {label}
    {#if $copied}
      <IconCheckmark class="size-3" />
    {:else}
      <IconCopy class="size-3" />
    {/if}
  </Button>
</span>
