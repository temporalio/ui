<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let title: string;
  export let content = '';
  export let error = '';
  export let icon: IconName = 'comet';
</script>

<div
  class="my-12 flex flex-col items-center justify-start gap-2 {$$props.class}"
  data-testid={$$props.testId}
>
  <span
    class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200"
  >
    <Icon name={icon} class="block h-full w-full" /></span
  >
  <p class="text-xl font-medium">{title}</p>
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
