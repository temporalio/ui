<script lang="ts">
  import { useDarkMode } from '$lib/utilities/dark-mode';

  export let content: string;

  $: theme = $useDarkMode ? 'dark' : 'light';
</script>

<section class="h-full w-full">
  {#key theme}
    <iframe
      title="output"
      src="/render?content={encodeURIComponent(content)}&theme={theme}"
      class="min-h-[300px] w-full rounded-md bg-primary shadow-md"
    />
  {/key}
</section>
