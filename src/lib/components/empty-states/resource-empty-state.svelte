<script lang="ts">
  import type { Snippet } from 'svelte';

  import { IconComet, type IconComponent } from '$lib/io/icon';

  interface Props {
    title: string;
    content?: string;
    Icon?: IconComponent;
    testId?: string;
    description?: Snippet;
    children?: Snippet;
  }

  let {
    title,
    content,
    Icon = IconComet,
    testId,
    description,
    children,
  }: Props = $props();
</script>

<div
  class="my-12 flex w-full min-w-0 flex-col items-center gap-4 whitespace-normal px-4 text-center text-primary"
  data-testid={testId}
  aria-live="polite"
>
  <span class="flex h-16 w-16 items-center justify-center" aria-hidden="true">
    <Icon class="block h-full w-full text-brand" />
  </span>
  <div class="flex w-full min-w-0 flex-col items-center gap-1">
    <h2 class="text-xl font-medium">{title}</h2>
    {#if description || content}
      <div class="flex max-w-3xl flex-col gap-2 text-sm text-secondary">
        {#if description}
          {@render description()}
        {:else}
          <p>{content}</p>
        {/if}
      </div>
    {/if}
  </div>
  {@render children?.()}
</div>
