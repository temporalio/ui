<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
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
    class="group flex items-center gap-1 {$$props['container-class']}"
    on:click={(e) => copy(e, content)}
  >
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
    <button
      on:click={(e) => copy(e, content)}
      aria-label={$copied ? copySuccessIconTitle : copyIconTitle}
      class={`${
        visible ? 'visible' : 'invisible group-hover:visible'
      } copy-button`}
    >
      <Icon
        title={$copied ? copySuccessIconTitle : copyIconTitle}
        name={$copied ? 'checkmark' : 'copy'}
      />
    </button>
  </button>
{:else}
  <div class="group flex items-center gap-1 {$$props['container-class']}">
    <slot>
      <span class={$$props.class} class:select-all={!$$slots.default}
        >{content}</span
      >
    </slot>
    <button
      on:click={(e) => copy(e, content)}
      aria-label={$copied ? copySuccessIconTitle : copyIconTitle}
      class={`${
        visible ? 'visible' : 'invisible group-hover:visible'
      } copy-button`}
    >
      <Icon
        title={$copied ? copySuccessIconTitle : copyIconTitle}
        name={$copied ? 'checkmark' : 'copy'}
      />
    </button>
  </div>
{/if}

<style lang="postcss">
  .copy-button {
    @apply m-1 rounded-md border-2 border-[transparent] hover:border-indigo-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:shadow-focus hover:shadow-blue-600/50 focus-visible:border-indigo-600 focus-visible:bg-gradient-to-br focus-visible:from-blue-100 focus-visible:to-purple-100 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;
  }
</style>
