<script lang="ts">
  import Icon, { Clipboard, Check } from 'svelte-hero-icons';
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

  const formatJSON = (jsonData) => {
    const parsedData = JSON.parse(jsonData);
    const formated = JSON.stringify(parsedData, undefined, 4);
    return formated;
  };
</script>

{#if content}
  <div class="relative group w-full mb-2">
    <div id="clipboard" />
    <h3 class="text-lg mb-2 w-full">{heading}</h3>
    <Highlight class="p-4" language={json} code={formatJSON(content)} />
    <button on:click={copy}>
      {#if copied}
        <Icon
          src={Check}
          class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-9 hidden group-hover:block hover:bg-gray-400 hover:border-gray-400"
        />
      {:else}
        <Icon
          src={Clipboard}
          class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-9 hidden group-hover:block hover:bg-gray-400 hover:border-gray-400"
        />
      {/if}
    </button>
  </div>
{/if}
