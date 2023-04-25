<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { PageServerData } from './$types';

  export let data: PageServerData;
</script>

<h6>Workflows loaded in<br /><code>+page.ts</code></h6>
<CodeBlock content={data.workflows} />
