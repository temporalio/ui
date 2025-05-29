<script lang="ts">
  import type { Snippet } from 'svelte';

  import CopyButton from '$lib/holocene/copyable/copy-button.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    copyable?: boolean;
    copyableText?: string;
    children: Snippet;
  }

  let { children, copyable, copyableText }: Props = $props();
</script>

<dt class="flex gap-2">
  {#if copyable}
    {@render children()}
    <CopyButton
      iconTitle={translate('common.copy-icon-title')}
      successIconTitle={translate('common.copy-success-icon-title')}
      {copyableText}
    />
  {:else}
    {@render children()}
  {/if}
</dt>
