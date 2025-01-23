<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props {
    title: string;
    content?: string;
    error?: string;
    icon?: IconName;
    testId?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    title,
    content = '',
    error = '',
    icon = 'comet',
    testId = '',
    class: className = '',
    children,
  }: Props = $props();
</script>

<div
  class="my-12 flex w-full flex-col items-center justify-start gap-2 text-primary {className}"
  data-testid={testId}
>
  <span
    class="surface-secondary flex h-16 w-16 items-center justify-center rounded-full"
  >
    <Icon name={icon} class="block h-full w-full" /></span
  >
  <p class="text-xl font-medium">{title}</p>
  {#if content}
    <p class="text-center">{content}</p>
  {/if}
  {#if error}
    <p class="border border-danger bg-danger p-5 text-center">
      {error}
    </p>
  {/if}
  {@render children?.()}
</div>
