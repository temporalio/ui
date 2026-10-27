<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  export interface CollapsibleProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
    label?: string;
    trigger?: Snippet<[boolean]>;
    open?: boolean;
    disabled?: boolean;
    lazyMount?: boolean;
    unmountOnExit?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    class?: string;
    triggerClass?: string;
    contentClass?: string;
    children?: Snippet<[boolean]>;
  }
</script>

<script lang="ts">
  import {
    Collapsible as ArkCollapsible,
    type CollapsibleOpenChangeDetails,
  } from '@ark-ui/svelte/collapsible';

  import { IconChevronDown } from '$lib/io/icon';

  import {
    collapsibleContentRecipe,
    collapsibleIndicatorRecipe,
    collapsibleRecipe,
    collapsibleTriggerRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    label = '',
    trigger,
    open = $bindable(false),
    disabled = false,
    lazyMount = false,
    unmountOnExit = false,
    onOpenChange,
    id = generatedId,
    class: className,
    triggerClass,
    contentClass,
    children,
    ...rest
  }: CollapsibleProps = $props();

  function handleOpenChange(details: CollapsibleOpenChangeDetails) {
    if (details.open === open) return;
    open = details.open;
    onOpenChange?.(details.open);
  }
</script>

<ArkCollapsible.Root
  {id}
  {open}
  {disabled}
  {lazyMount}
  {unmountOnExit}
  onOpenChange={handleOpenChange}
  class={collapsibleRecipe(className)}
  {...rest}
>
  <ArkCollapsible.Trigger
    class={collapsibleTriggerRecipe(triggerClass)}
    data-track-name="collapsible"
    data-track-intent="toggle"
    data-track-text={label || '*textContent*'}
  >
    {#if trigger}
      {@render trigger(open)}
    {:else}
      <span>{label}</span>
      <ArkCollapsible.Indicator class={collapsibleIndicatorRecipe()}>
        <IconChevronDown width={16} height={16} />
      </ArkCollapsible.Indicator>
    {/if}
  </ArkCollapsible.Trigger>
  <ArkCollapsible.Content class={collapsibleContentRecipe(contentClass)}>
    <div class="pt-3">{@render children?.(open)}</div>
  </ArkCollapsible.Content>
</ArkCollapsible.Root>

<style>
  @keyframes -global-io-ark-collapsible-expand {
    from {
      height: var(--collapsed-height, 0);
    }

    to {
      height: var(--height);
    }
  }

  @keyframes -global-io-ark-collapsible-collapse {
    from {
      height: var(--height);
    }

    to {
      height: var(--collapsed-height, 0);
    }
  }

  :global(.io-ark-collapsible-content[data-state='open']) {
    animation: io-ark-collapsible-expand 150ms ease-out;
  }

  :global(.io-ark-collapsible-content[data-state='closed']) {
    animation: io-ark-collapsible-collapse 150ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.io-ark-collapsible-content) {
      animation: none !important;
    }
  }
</style>
