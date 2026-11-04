<script lang="ts">
  import { Button } from '$lib/io/button';
  import { IconCheckmark, IconCopy } from '$lib/io/icon';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  let { question }: { question: string } = $props();

  const { copy, copied } = copyToClipboard();
</script>

<li class="rounded-lg rounded-bl-none bg-surface-tertiary">
  <Button
    class="w-full justify-between gap-3 whitespace-normal rounded-lg rounded-bl-none px-[11px] py-[7px] text-left text-sm leading-5"
    colorScheme="ghost"
    size="sm"
    aria-label={$copied ? question + ', copied' : question + ', copy question'}
    onclick={(event) => copy(event, question)}
  >
    <span class="min-w-0">{question}</span>
    {#if $copied}
      <IconCheckmark class="size-3 shrink-0" />
    {:else}
      <IconCopy class="size-3 shrink-0 text-secondary" />
    {/if}
  </Button>
</li>
