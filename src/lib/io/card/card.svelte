<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import type { IconComponent } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  import {
    cardActionsRecipe,
    cardContentRecipe,
    cardDescriptionRecipe,
    cardFooterRecipe,
    cardMediaRecipe,
    cardRecipe,
    cardTitleRecipe,
  } from './recipe';

  export interface CardProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'class' | 'title'
  > {
    title: string | Snippet;
    description: string | Snippet;
    LeadingIcon?: ConditionalValue<IconComponent>;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    media?: Snippet;
    actions?: Snippet;
    footer?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  const {
    title,
    description,
    LeadingIcon,
    headingLevel = 3,
    media,
    actions,
    footer,
    class: className,
    ...rest
  }: CardProps = $props();
</script>

{#snippet textOrSnippet(content: string | Snippet)}
  {#if typeof content === 'string'}
    {content}
  {:else}
    {@render content()}
  {/if}
{/snippet}

<div {...rest} class={twMerge(cardRecipe(), className)}>
  {#if media}
    <div class={cardMediaRecipe()}>
      {@render media()}
    </div>
  {/if}
  <div class={cardContentRecipe()}>
    <svelte:element this={`h${headingLevel}`} class={cardTitleRecipe()}>
      {#if LeadingIcon}
        <LeadingIcon width="1em" height="1em" />
      {/if}
      {@render textOrSnippet(title)}
    </svelte:element>
    <div class={cardDescriptionRecipe()}>
      {@render textOrSnippet(description)}
    </div>
    {#if actions}
      <div class={cardActionsRecipe()}>
        {@render actions()}
      </div>
    {/if}
  </div>
  {#if footer}
    <div class={cardFooterRecipe()}>
      {@render footer()}
    </div>
  {/if}
</div>
