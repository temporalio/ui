<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
  import { noop } from 'svelte/internal';

  export let content: string;
  export let visible = false;
  export let color = 'black';
  export let clickAllToCopy = false;

  export let size:
    | 'xs'
    | 'sm'
    | 'lg'
    | '1x'
    | '2x'
    | '3x'
    | '4x'
    | '5x'
    | '6x'
    | '7x'
    | '8x'
    | '9x'
    | '10x' = '1x';

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
  class="flex gap-2 items-center group {$$props['container-class']}"
  on:click={clickAllToCopy ? copy : noop}
>
  <slot>
    <span class={$$props.class} class:select-all={!$$slots.default}
      >{content}</span
    >
  </slot>
  <button on:click={copy}>
    <Icon
      icon={copied ? faCheck : faCopy}
      {color}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
      {size}
    />
  </button>
</div>
