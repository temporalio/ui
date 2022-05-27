<script lang="ts">
  import Icon from 'svelte-fa';
  import { faMeteor } from '@fortawesome/free-solid-svg-icons';

  export let title: string;
  export let content: string = '';
</script>

<div
  class="my-12 flex flex-col items-center justify-start gap-2 {$$props.class}"
  data-cy={$$props.dataCy}
>
  <span
    class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
  >
    <Icon icon={faMeteor} scale={1.2} class="block h-full w-full" /></span
  >
  <h2 class="text-xl font-medium">{title}</h2>
  {#if content}
    <p class="text-center">{content}</p>
  {/if}
</div>
