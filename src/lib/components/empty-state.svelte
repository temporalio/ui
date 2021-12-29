<script lang="ts">
  import Icon from 'svelte-fa';
  import { faMeteor } from '@fortawesome/free-solid-svg-icons';

  export let title: string;
  export let content: string = '';
</script>

<div class="mt-12 flex flex-col justify-start items-center gap-2">
  <span
    class="flex rounded-full items-center justify-center w-16 h-16 bg-gray-200"
  >
    <Icon icon={faMeteor} scale={1.2} class="block w-full h-full" /></span
  >
  <h2 class="text-xl font-medium">No {title} Found</h2>
  {#if content}
    <p class="text-center">{content}</p>
  {/if}
</div>
