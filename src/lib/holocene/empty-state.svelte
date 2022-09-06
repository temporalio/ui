<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let title: string;
  export let content: string = '';
  export let error: string = '';
  export let icon: IconName = 'comet';
</script>

<div
  class="my-12 flex flex-col items-center justify-start gap-2 {$$props.class}"
  data-cy={$$props.dataCy}
>
  <span
    class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
  >
    <Icon name={icon} class="block h-full w-full" /></span
  >
  <h2 class="text-xl font-medium">{title}</h2>
  {#if content}
    <p class="text-center">{content}</p>
  {/if}
  {#if error}
    <p
      class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
    >
      {error}
    </p>
  {/if}
  <slot />
</div>
