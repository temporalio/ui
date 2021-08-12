<script lang="ts">
  import Icon, { Clipboard } from 'svelte-hero-icons';

  export let heading = '';
  export let content = '';
  export let copied = false;

  const copy = () => navigator.clipboard.writeText(content).then(() => {
    copied = !copied;
    setTimeout(() => copied = false, 2000);
  }).catch(error => console.error(error));

</script>

{#if content}
  <div>
    <h3 class="text-lg mt-6 mb-2 w-full">{heading}</h3>
    <code class="relative group">
      <div id="clipboard" />
      <pre
        class="p-6 bg-gray-200 relative w-full mb-6">
        {JSON.stringify(content)}
        <button on:click={copy}> 
          {#if copied}
          <p class="w-8 h-8 text-purple-900 absolute right-9 top-0">Copied!</p>
          {:else}
          <Icon src={Clipboard} class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-0 hidden group-hover:block hover:bg-gray-400" />
          {/if}
        </button>
      </pre>
    </code>
  </div>
{/if}
