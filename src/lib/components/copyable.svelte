<script lang="ts">
  import Icon from 'holocene/components/icon/index.svelte';
  import { noop } from 'svelte/internal';

  export let content: string;
  export let visible = false;
  export let color = 'black';
  export let clickAllToCopy = false;

  let copied = false;

  const copy = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard
      .writeText(content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 500);
      })
      .catch((error) => console.error(error));
  };
</script>

<div
  class="group flex items-center gap-2 {$$props['container-class']}"
  on:click={clickAllToCopy ? copy : noop}
>
  <slot>
    <span class={$$props.class} class:select-all={!$$slots.default}
      >{content}</span
    >
  </slot>
  <button on:click={copy}>
    <Icon
      name={copied ? 'checkMark' : 'copy'}
      stroke={color}
      class={`${visible ? 'visible' : 'invisible group-hover:visible'} h-4`}
    />
  </button>
</div>
