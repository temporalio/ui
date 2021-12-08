<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { Clipboard, Check } from 'svelte-hero-icons';

  export let heading = '';
  export let content: string | Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let inline = false;

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
    const formated = JSON.stringify(parsedData, undefined, 2);
    return formated;
  };

  onMount(() => window.Prism.highlightAll());
</script>

{#if content || content === null}
  <div class="relative w-full">
    {#if !inline}<div id="clipboard" />{/if}

    {#if heading}
      <h3 class="text-lg mb-2 w-full">{heading}</h3>
    {/if}
    {#if inline}
      <code class="px-2 block language-json overflow-hidden">
        {JSON.stringify(content)}
      </code>
    {:else}
      <pre
        class="p-4">
        <code class="language-json">
          {formatJSON(JSON.stringify(content))}
        </code>
      </pre>
    {/if}
    {#if !inline}
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
    {/if}
  </div>
{/if}
