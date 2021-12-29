<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import Icon from 'svelte-fa';
  import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
  import Button from '$lib/components/button.svelte';
</script>

<section>
  <div class="flex items-center">
    <Button>
      <Icon icon={faSyncAlt} scale={0.8} class="block w-full h-full" />
      Refresh</Button
    >
    <p class="ml-9">Stack Trace at</p>
  </div>
  <CodeBlock content={'console.log(hello);'} />
</section>
