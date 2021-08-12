<script lang="ts">
  import Icon, { Clipboard } from 'svelte-hero-icons';
  import { Highlight } from 'svelte-highlight';
  import json from 'svelte-highlight/src/languages/json';
  import 'svelte-highlight/src/styles/agate.css';

  export let heading = '';
  export let content = '';
  export let copied = false;

  const copy = () =>
    navigator.clipboard
      .writeText(content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 2000);
      })
      .catch((error) => console.error(error));
</script>

{#if content}
  <div class="relative group w-full mb-2">
    <div id="clipboard" />
    <h3 class="text-lg mt-6 mb-2 w-full">{heading}</h3>
    <Highlight language={json} code={content} />
    <button on:click={copy}>
      {#if copied}
        <p
          class="w-20 h-6 text-purple-900 bg-gray-300 absolute right-0 top-9 text-center"
        >
          Copied!
        </p>
      {:else}
        <Icon
          src={Clipboard}
          class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-9 hidden group-hover:block hover:bg-gray-400 hover:border-gray-400"
        />
      {/if}
    </button>
  </div>
{/if}

<style>
  .hljs {
    height: 10em;
    overflow-y: scroll;
  }
</style>
