<script>
  import { onMount } from 'svelte';

  export let content;

  let textarea;

  onMount(() => {
    textarea.select();
    document.execCommand('copy');
  });
</script>

<textarea bind:value={content} bind:this={textarea} />
