<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  export let content: string;
  export let visible = false;
  export let clickAllToCopy = false;
  export let copyIconTitle: string;
  export let copySuccessIconTitle: string;

  const { copy, copied } = copyToClipboard();
</script>

{#if clickAllToCopy}
  <button
    class="group flex items-center gap-2 {$$props['container-class']}"
    on:click={(e) => copy(e, content)}
  >
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
    <IconButton
      on:click={(e) => copy(e, content)}
      class={`${visible ? 'visible' : 'invisible group-hover:visible'}`}
      icon={$copied ? 'checkmark' : 'copy'}
      label={$copied ? copySuccessIconTitle : copyIconTitle}
    />
  </button>
{:else}
  <div class="group flex items-center gap-2 {$$props['container-class']}">
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>

    <IconButton
      on:click={(e) => copy(e, content)}
      class={`${visible ? 'visible' : 'invisible group-hover:visible'}`}
      icon={$copied ? 'checkmark' : 'copy'}
      label={$copied ? copySuccessIconTitle : copyIconTitle}
    />
  </div>
{/if}
