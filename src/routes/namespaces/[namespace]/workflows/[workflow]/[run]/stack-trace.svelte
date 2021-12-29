<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';
  import Icon from 'svelte-fa';
  import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
  import Button from '$lib/components/button.svelte';

  let currentdate = new Date();
  $: datetime = currentdate.toLocaleTimeString();
</script>

<section>
  <div class="flex items-center">
    <Button on:click={() => (currentdate = new Date())}>
      <Icon icon={faSyncAlt} scale={0.8} class="block w-full h-full" />
      Refresh</Button
    >
    <p class="ml-9">Stack Trace at {datetime}</p>
  </div>
  <CodeBlock content={'test'} />
</section>
