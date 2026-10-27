<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon';

  export interface AccordionProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title' | 'children'
  > {
    title: string;
    id?: string;
    subtitle?: string;
    Icon?: IconComponent;
    open?: boolean;
    expandable?: boolean;
    disabled?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
    class?: string;
    summary?: Snippet;
    action?: Snippet;
    children?: Snippet<[boolean]>;
  }
</script>

<script lang="ts">
  import {
    type AccordionValueChangeDetails,
    Accordion as ArkAccordion,
  } from '@ark-ui/svelte/accordion';

  import { Badge } from '$lib/io/badge';
  import { IconChevronDown, IconChevronUp } from '$lib/io/icon';

  import { accordionRecipe, accordionTriggerRecipe } from './recipe';

  const generatedId = $props.id();
  let {
    title,
    id = generatedId,
    subtitle = '',
    Icon,
    open = $bindable(false),
    expandable = true,
    disabled = false,
    error = '',
    onToggle,
    class: className,
    summary,
    action,
    children,
    ...rest
  }: AccordionProps = $props();

  const value = $derived(open ? ['panel'] : []);
  const Glyph = $derived(open ? IconChevronUp : IconChevronDown);

  function handleValueChange(details: AccordionValueChangeDetails) {
    const nextOpen = details.value.includes('panel');
    if (nextOpen === open) return;
    open = nextOpen;
    onToggle?.();
  }
</script>

{#snippet titleContent()}
  <span class="flex w-full items-center justify-between gap-2">
    <span class="flex min-w-0 items-center gap-2">
      <span
        class="flex shrink-0 items-center gap-2 text-xl font-medium leading-[inherit]"
        >{#if Icon}<Icon />{/if}{title}</span
      >
      <span class="text-secondary max-sm:hidden">{@render summary?.()}</span>
    </span>
    {#if expandable}<Glyph class="shrink-0" />{/if}
  </span>
  <span class="text-secondary sm:hidden">{@render summary?.()}</span>
  <span class="flex items-center">
    {#if error}<Badge class="mr-2" colorScheme="danger" text={error} />{/if}
    <span class="text-secondary">{subtitle}</span>
  </span>
{/snippet}

{#if expandable}
  <ArkAccordion.Root
    {id}
    ids={{
      itemTrigger: () => `${id}-trigger`,
      itemContent: () => `${id}-content`,
    }}
    {value}
    {disabled}
    collapsible
    lazyMount={false}
    unmountOnExit={false}
    onValueChange={handleValueChange}
    data-track-container={title}
    class={accordionRecipe({ className })}
    {...rest}
  >
    <ArkAccordion.Item value="panel" class="rounded-[inherit]">
      <div class="flex w-full items-center rounded-[inherit]">
        <!-- Only the title uses heading typography; the trigger inherits body text. -->
        <h3
          class="min-w-0 grow rounded-[inherit] text-[length:inherit] font-normal"
        >
          <ArkAccordion.ItemTrigger
            class={accordionTriggerRecipe({ open, hasAction: !!action })}
            data-track-name="accordion"
            data-track-intent="toggle"
            data-track-text={title}
            >{@render titleContent()}</ArkAccordion.ItemTrigger
          >
        </h3>
        {#if action}<div class="flex shrink-0 items-center gap-2 pr-2">
            {@render action()}
          </div>{/if}
      </div>
      <ArkAccordion.ItemContent class="mt-4 w-full p-4"
        >{@render children?.(open)}</ArkAccordion.ItemContent
      >
    </ArkAccordion.Item>
  </ArkAccordion.Root>
{:else}
  <div
    class={accordionRecipe({ expandable: false, className })}
    data-track-container={title}
    {...rest}
  >
    <div class="flex w-full items-center justify-between gap-2">
      <h3 class="flex min-w-0 grow flex-col text-[length:inherit] font-normal">
        {@render titleContent()}
      </h3>
      {#if action}<div class="flex shrink-0 items-center gap-2 pr-2">
          {@render action()}
        </div>{/if}
    </div>
    <div class="mt-6 w-full" hidden={!open}>{@render children?.(open)}</div>
  </div>
{/if}
