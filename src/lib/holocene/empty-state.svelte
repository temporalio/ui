<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props {
    title: string;
    content?: string;
    error?: string;
    icon?: IconName;
    class?: string;
    testId?: string;
    children?: Snippet;
  }

  let {
    title,
    content = '',
    error = '',
    icon = 'comet',
    class: className = '',
    testId,
    children,
  }: Props = $props();
</script>

<div
  class="my-6 flex w-full flex-col items-center justify-start gap-2 text-primary {className}"
  data-testid={testId}
>
  <span class="flex h-10 w-10 items-center justify-center text-secondary">
    <Icon name={icon} class="block h-full w-full" /></span
  >
  <p class="text-base font-semibold">{title}</p>
  {#if content}
    <p class="max-w-prose text-center text-sm text-secondary">{content}</p>
  {/if}
  {#if error}
    <p
      class="rounded-panel border border-danger bg-danger p-3 text-center text-sm"
    >
      {error}
    </p>
  {/if}
  {@render children?.()}
</div>
