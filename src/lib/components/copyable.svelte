<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

  export let content: string;
  export let visible = false;

  let copied = false;

  const copy = (event: Event) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 500);
      })
      .catch((error) => console.error(error));
  };
</script>

<div class="flex gap-2 items-center">
  <slot>{content}</slot>
  <button on:click|preventDefault|stopPropagation={copy}>
    <Icon
      icon={copied ? faCheck : faCopy}
      class={visible ? 'visible' : 'invisible group-hover:visible'}
    />
  </button>
</div>
