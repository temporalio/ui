<script lang="ts">
  import Icon, { Clipboard, Check } from 'svelte-hero-icons';

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
  <div class="mb-6 relative">
    <h3 class="text-lg mt-6 w-full">{heading}</h3>
    <code class="relative group">
      <pre
        class="p-4 bg-gray-200 relative w-full overflow-x-scroll">
        {content}
        <button on:click={copy}>
          {#if copied}
          <Icon src={Check} class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-400 absolute left-0 top-0 hidden group-hover:block hover:bg-gray-400" />
          {:else}
          <Icon src={Clipboard} class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-400 absolute left-0 top-0 hidden group-hover:block hover:bg-gray-400" />
          {/if}
        </button>
      </pre>
    </code>
  </div>
{/if}
