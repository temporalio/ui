<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { noop } from 'svelte/internal';

  export let content: string;
  export let visible = false;
  export let color = 'black';
  export let clickAllToCopy = false;

  const { copy, copied } = copyToClipboard(500);
</script>

<div
  class="group flex items-center gap-2 {$$props['container-class']}"
  on:click={clickAllToCopy ? (e) => copy(e, content) : noop}
>
  <slot>
    <span class={$$props.class} class:select-all={!$$slots.default}
      >{content}</span
    >
  </slot>
  <button on:click={(e) => copy(e, content)}>
    <Icon
      name={$copied ? 'checkmark' : 'copy'}
      stroke={color}
      class={`${visible ? 'visible' : 'invisible group-hover:visible'} h-4`}
    />
  </button>
</div>
