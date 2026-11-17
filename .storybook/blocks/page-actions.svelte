<script lang="ts">
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { IconCheckmark } from '$lib/io/icon';

  let { markdown, id }: { markdown: string; id: string } = $props();
  let url = $state('');
  let status = $state('');

  $effect(() => {
    // Plain text opens in the browser instead of downloading a Markdown attachment.
    const objectUrl = URL.createObjectURL(
      new Blob([markdown], { type: 'text/plain;charset=utf-8' }),
    );
    url = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  });

  $effect(() => {
    if (!status) return;
    const timeout = setTimeout(() => {
      status = '';
    }, 4000);
    return () => clearTimeout(timeout);
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      status = 'Page copied';
    } catch {
      status = 'Could not copy. Use View as Markdown to copy the text.';
    }
  }
</script>

<SplitButton
  {id}
  label={status === 'Page copied' ? 'Copied' : 'Copy Page'}
  TrailingIcon={status === 'Page copied' ? IconCheckmark : undefined}
  menuLabel="More page actions"
  position="right"
  menuClass="min-w-56"
  onclick={copy}
>
  <MenuItem href={url} newTab disabled={!url}>View as Markdown</MenuItem>
</SplitButton>
<span
  role="status"
  class={status === 'Page copied' ? 'sr-only' : 'io-docs-page-actions-status'}
  >{status}</span
>
