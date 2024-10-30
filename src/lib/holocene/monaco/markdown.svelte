<script lang="ts">
  import { useDarkMode } from '$lib/utilities/dark-mode';

  export let content: string;
  let iframe;

  $: theme = $useDarkMode ? 'dark' : 'light';

  const resizeIframe = () => {
    if (!iframe) return;
    iframe.height = '';
    iframe.height = iframe.contentWindow.document.body.scrollHeight + 2 + 'px';
  };
</script>

<section class="h-full w-full">
  {#key theme}
    <iframe
      bind:this={iframe}
      on:load={resizeIframe}
      title="output"
      src="/render?content={encodeURIComponent(content)}&theme={theme}"
      class="w-full rounded-md"
    />
  {/key}
</section>
