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

<div class="group flex items-center gap-1 {$$props['container-class']}">
  {#if clickAllToCopy}
    <button
      type="button"
      class="break-all text-left"
      on:click={handleOnClick}
      aria-label={$$slots.default ? undefined : `Copy ${content}`}
    >
      <slot>
        <span class={$$props.class} class:select-all={!$$slots.default}
          >{content}</span
        >
      </slot>
    </button>
  {:else}
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
  {/if}
  <CopyButton
    {copyIconTitle}
    {copySuccessIconTitle}
    class={visible
      ? 'visible'
      : 'invisible group-focus-within:visible group-hover:visible'}
    on:click={handleOnClick}
    copied={$copied}
  />
</div>
