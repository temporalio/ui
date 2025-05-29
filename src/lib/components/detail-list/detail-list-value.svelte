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

<dt class="col-[2] flex gap-2">
  {@render children()}
  {#if copyable}
    <CopyButton
      iconTitle={translate('common.copy-icon-title')}
      successIconTitle={translate('common.copy-success-icon-title')}
      {copyableText}
    />
  {/if}
</dt>
