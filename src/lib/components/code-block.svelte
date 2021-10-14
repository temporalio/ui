<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { Clipboard, Check } from 'svelte-hero-icons';

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

  const formatJSON = (jsonData: string) => {
    const parsedData = JSON.parse(jsonData);
    const formated = JSON.stringify(parsedData, undefined, 4);
    return formated;
  };

  onMount(() => window.Prism.highlightAll());
</script>

{#if content}
  <div class="relative group w-full mb-2">
    <div id="clipboard" />

    {#if heading}
      <h3 class="text-lg mb-2 w-full">{heading}</h3>
    {/if}
    <pre
      class="p-4">
      <code class="language-json">
        {formatJSON(content)}
      </code>
    </pre>
    <button on:click={copy}>
      {#if copied}
        <Icon
          src={Check}
          class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-0 hidden group-hover:block hover:bg-gray-400 hover:border-gray-400"
        />
      {:else}
        <Icon
          src={Clipboard}
          class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-0 hidden group-hover:block hover:bg-gray-400 hover:border-gray-400"
        />
      {/if}
    </button>
  </div>
{/if}
