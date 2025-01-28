<script lang="ts">
  import type { Snippet } from 'svelte';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import CopyButton from './button.svelte';

  interface Props {
    content: string;
    visible?: boolean;
    clickAllToCopy?: boolean;
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
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
    children,
    ...rest
  }: Props = $props();

  const { copy, copied } = copyToClipboard();

  function handleOnClick(e: Event) {
    copy(e, content);
  }
</script>

{#if clickAllToCopy}
  <button
    class="group flex items-center gap-1 break-all {rest['container-class']}"
    onclick={handleOnClick}
  >
    {#if children}
      {@render children()}
    {:else}
      <span class="select-all {className}">{content}</span>
    {/if}
    <CopyButton
      {copyIconTitle}
      {copySuccessIconTitle}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
      onclick={handleOnClick}
      copied={$copied}
    />
  </button>
{:else}
  <div class="group flex items-center gap-1 {rest['container-class']}">
    {#if children}
      {@render children()}
    {:else}
      <span class="select-all {className}">{content}</span>
    {/if}
    <CopyButton
      {copyIconTitle}
      {copySuccessIconTitle}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
      onclick={handleOnClick}
      copied={$copied}
    />
  </div>
{/if}
