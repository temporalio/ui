<script lang="ts">
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import CopyButton from './button.svelte';

  export let content: string;
  export let visible = false;
  export let clickAllToCopy = false;
  export let copyIconTitle: string;
  export let copySuccessIconTitle: string;

  const { copy, copied } = copyToClipboard();

  function handleOnClick(e: Event) {
    copy(e, content);
  }
</script>

{#if clickAllToCopy}
  <button
    class="group flex items-center gap-1 break-all {$$props['container-class']}"
    onclick={handleOnClick}
  >
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
    <CopyButton
      {copyIconTitle}
      {copySuccessIconTitle}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
      onclick={handleOnClick}
      copied={$copied}
    />
  </button>
{:else}
  <div class="group flex items-center gap-1 {$$props['container-class']}">
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
    <CopyButton
      {copyIconTitle}
      {copySuccessIconTitle}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
      onclick={handleOnClick}
      copied={$copied}
    />
  </div>
{/if}
