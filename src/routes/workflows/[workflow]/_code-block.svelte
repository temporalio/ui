<script lang="ts">
  import CopyClipBoard from '$lib/components/copy-clipboard.svelte';
  import Icon, { Clipboard } from 'svelte-hero-icons';

  export let heading = '';
  export let content = '';

  const copy = () => {
    const app = new CopyClipBoard({
      target: document.getElementById('clipboard'),
      props: { content },
    });
    app.$destroy();
  };
</script>

{#if content}
  <div>
    <h3 class="text-lg mt-6 mb-2 w-full">{heading}</h3>
    <code class="relative group">
      <div id="clipboard" />
      <pre
        class="p-6 bg-gray-200 relative">
        {JSON.stringify(content)}
        <button on:click={copy}> <Icon src={Clipboard} class="w-8 h-8 text-purple-900 bg-gray-300 border-2 border-gray-200 absolute right-0 top-0 hidden group-hover:block hover:bg-gray-400" /></button>
      </pre>
    </code>
  </div>
{/if}
