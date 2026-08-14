<script lang="ts">
  import type { Snippet } from 'svelte';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import CopyButton from './button.svelte';

  interface Props {
    content: string;
    visible?: boolean;
    clickAllToCopy?: boolean;
    copyIconTitle: string;
    copySuccessIconTitle: string;
    class?: string;
    'container-class'?: string;
    children?: Snippet;
  }

  let {
    content,
    visible = false,
    clickAllToCopy = false,
    copyIconTitle,
    copySuccessIconTitle,
    class: className = '',
    'container-class': containerClass = '',
    children,
  }: Props = $props();

  const { copy, copied } = copyToClipboard();

  function handleOnClick(e: Event) {
    copy(e, content);
  }
</script>

<div class="group flex items-center gap-1 {containerClass}">
  {#if clickAllToCopy}
    <button
      type="button"
      class="break-all text-left"
      onclick={handleOnClick}
      aria-label={children ? undefined : `Copy ${content}`}
    >
      {#if children}
        {@render children()}
      {:else}
        <span class={['select-all', className]}>{content}</span>
      {/if}
    </button>
  {:else if children}
    {@render children()}
  {:else}
    <span class={['select-all', className]}>{content}</span>
  {/if}
  <CopyButton
    {copyIconTitle}
    {copySuccessIconTitle}
    class={visible
      ? 'visible'
      : 'invisible group-focus-within:visible group-hover:visible'}
    onclick={handleOnClick}
    copied={$copied}
  />
</div>
