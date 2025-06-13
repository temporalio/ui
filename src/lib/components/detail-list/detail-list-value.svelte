<script lang="ts">
  import type { Snippet } from 'svelte';

  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  interface Props {
    copyable?: boolean;
    copyableText?: string;
    children: Snippet;
  }

  const { children, copyable, copyableText }: Props = $props();
  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, copyableText);
  };
</script>

<dt class="col-[2] flex">
  {@render children()}
  {#if copyable}
    <!-- 
      The CopyButton is larger than the line height, which pushes around grid items. Rather than removing its margin/padding, which makes the 
      click box too small, it is absolute so it can slightly spill over the edges of the dt.
    -->
    <div class="relative flex w-6 items-center">
      <CopyButton
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        copied={$copied}
        on:click={handleCopy}
        class="absolute left-0"
      />
    </div>
  {/if}
</dt>
