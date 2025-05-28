<script lang="ts">
  import type { Snippet } from 'svelte';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import CopyIcon from './copy-icon.svelte';

  interface Props {
    copyableText: string;
    iconTitle: string;
    successIconTitle: string;
    children?: Snippet;
  }

  const { copyableText, children, iconTitle, successIconTitle }: Props =
    $props();
  const { copy, copied } = copyToClipboard();

  const handleClick = (e: Event) => {
    copy(e, copyableText);
  };
</script>

<button onclick={handleClick} class="flex items-center gap-1">
  {@render children?.()}
  <CopyIcon
    title={iconTitle}
    successTitle={successIconTitle}
    copied={$copied}
  />
</button>
