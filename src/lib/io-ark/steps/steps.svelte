<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { StepsOrientation } from './recipe';

  export interface StepsItem {
    title: string;
    description?: string;
  }

  export interface StepsProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    items: StepsItem[];
    step?: number;
    orientation?: StepsOrientation;
    linear?: boolean;
    isStepValid?: (index: number) => boolean;
    showControls?: boolean;
    prevLabel?: string;
    nextLabel?: string;
    completedLabel?: string;
    onStepChange?: (step: number) => void;
    onStepComplete?: () => void;
    id?: string;
    class?: string;
    contentClass?: string;
    content?: Snippet<[StepsItem, number]>;
    completed?: Snippet;
  }
</script>

<script lang="ts">
  import {
    Steps as ArkSteps,
    type StepsStepChangeDetails,
  } from '@ark-ui/svelte/steps';

  import { IconCheckmark } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';

  import {
    stepsContentRecipe,
    stepsControlsRecipe,
    stepsDescriptionRecipe,
    stepsIndicatorRecipe,
    stepsItemRecipe,
    stepsListRecipe,
    stepsRecipe,
    stepsSeparatorRecipe,
    stepsTitleRecipe,
    stepsTriggerRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    items,
    step = $bindable(0),
    orientation = 'horizontal',
    linear = false,
    isStepValid,
    showControls = true,
    prevLabel = 'Back',
    nextLabel = 'Next',
    completedLabel = 'Completed',
    onStepChange,
    onStepComplete,
    id = generatedId,
    class: className,
    contentClass,
    content,
    completed,
    ...rest
  }: StepsProps = $props();

  function handleStepChange(details: StepsStepChangeDetails) {
    if (details.step === step) return;
    step = details.step;
    onStepChange?.(details.step);
  }
</script>

<ArkSteps.Root
  {id}
  count={items.length}
  {step}
  {orientation}
  {linear}
  {isStepValid}
  {onStepComplete}
  onStepChange={handleStepChange}
  class={stepsRecipe({ orientation, className })}
  {...rest}
>
  <ArkSteps.List class={stepsListRecipe({ orientation })}>
    {#each items as item, index (index)}
      <ArkSteps.Item
        {index}
        class={stepsItemRecipe({
          orientation,
          last: index === items.length - 1,
        })}
      >
        <ArkSteps.Trigger
          class={stepsTriggerRecipe()}
          data-track-name="steps"
          data-track-intent="select"
          data-track-text={item.title}
        >
          <ArkSteps.Indicator class={stepsIndicatorRecipe()}>
            <ArkSteps.ItemContext>
              {#snippet render(itemState)}
                {#if itemState().completed}
                  <IconCheckmark width={16} height={16} />
                {:else}
                  {index + 1}
                {/if}
              {/snippet}
            </ArkSteps.ItemContext>
          </ArkSteps.Indicator>
          <span class="min-w-0 pt-1.5">
            <span class={stepsTitleRecipe()}>{item.title}</span>
            <ArkSteps.ItemContext>
              {#snippet render(itemState)}
                {#if itemState().completed}
                  <span class="sr-only">, {completedLabel}</span>
                {/if}
              {/snippet}
            </ArkSteps.ItemContext>
            {#if item.description}
              <span class={stepsDescriptionRecipe()}>{item.description}</span>
            {/if}
          </span>
        </ArkSteps.Trigger>
        {#if index < items.length - 1}
          <ArkSteps.Separator class={stepsSeparatorRecipe({ orientation })} />
        {/if}
      </ArkSteps.Item>
    {/each}
  </ArkSteps.List>
  <div class="flex min-w-0 flex-1 flex-col gap-4">
    {#if content}
      {#each items as item, index (index)}
        <ArkSteps.Content {index} class={stepsContentRecipe(contentClass)}>
          {@render content(item, index)}
        </ArkSteps.Content>
      {/each}
    {/if}
    {#if completed}
      <ArkSteps.CompletedContent class={stepsContentRecipe(contentClass)}>
        {@render completed()}
      </ArkSteps.CompletedContent>
    {/if}
    {#if showControls}
      <div class={stepsControlsRecipe()}>
        <ArkSteps.PrevTrigger>
          {#snippet asChild(props)}
            <Button
              {...props() as Record<string, unknown>}
              colorScheme="tertiary"
              tracking={false}>{prevLabel}</Button
            >
          {/snippet}
        </ArkSteps.PrevTrigger>
        <ArkSteps.NextTrigger>
          {#snippet asChild(props)}
            <Button {...props() as Record<string, unknown>} tracking={false}
              >{nextLabel}</Button
            >
          {/snippet}
        </ArkSteps.NextTrigger>
      </div>
    {/if}
  </div>
</ArkSteps.Root>
