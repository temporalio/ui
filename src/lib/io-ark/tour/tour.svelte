<script lang="ts" module>
  import type { TourStepPlacement } from '@ark-ui/svelte/tour';

  export type TourStepType = 'tooltip' | 'dialog';

  export interface TourStep {
    id: string;
    title: string;
    description: string;
    target?: () => HTMLElement | null;
    placement?: TourStepPlacement;
    type?: TourStepType;
    backdrop?: boolean;
  }

  export type TourActionProps = Record<string, unknown>;

  export interface TourProps {
    steps: TourStep[];
    open?: boolean;
    nextLabel?: string;
    backLabel?: string;
    finishLabel?: string;
    skipLabel?: string;
    closeLabel?: string;
    showProgress?: boolean;
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
    keyboardNavigation?: boolean;
    spotlightRadius?: number;
    onStepChange?: (stepIndex: number) => void;
    onComplete?: () => void;
    onSkip?: () => void;
    onDismiss?: () => void;
    id?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { Portal } from '@ark-ui/svelte/portal';
  import {
    Tour as ArkTour,
    type TourStatusChangeDetails,
    type TourStepAction,
    type TourStepChangeDetails,
    type TourStepDetails,
    useTour,
  } from '@ark-ui/svelte/tour';
  import { untrack } from 'svelte';

  import { IconClose } from '$lib/io/icon';
  import { Button, type ButtonColorScheme } from '$lib/io-ark/button';

  import {
    tourActionsRecipe,
    tourBackdropRecipe,
    tourContentRecipe,
    tourDescriptionRecipe,
    tourFooterRecipe,
    tourHeaderRecipe,
    tourPositionerRecipe,
    tourProgressTextRecipe,
    tourSpotlightRecipe,
    tourTitleRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    steps,
    open = $bindable(false),
    nextLabel = 'Next',
    backLabel = 'Back',
    finishLabel = 'Finish',
    skipLabel = 'Skip tour',
    closeLabel = 'Close tour',
    showProgress = true,
    closeOnEscape = true,
    closeOnInteractOutside = false,
    keyboardNavigation = true,
    spotlightRadius = 4,
    onStepChange,
    onComplete,
    onSkip,
    onDismiss,
    id = generatedId,
    class: className,
  }: TourProps = $props();

  function getActions(index: number): TourStepAction[] {
    const isLast = index === steps.length - 1;
    return [
      ...(!isLast ? [{ label: skipLabel, action: 'skip' as const }] : []),
      ...(index > 0 ? [{ label: backLabel, action: 'prev' as const }] : []),
      isLast
        ? { label: finishLabel, action: 'dismiss' as const }
        : { label: nextLabel, action: 'next' as const },
    ];
  }

  const tourSteps: TourStepDetails[] = $derived(
    steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      target: step.target,
      placement: step.placement ?? (step.target ? 'bottom' : 'center'),
      type: step.type ?? (step.target ? 'tooltip' : 'dialog'),
      backdrop: step.backdrop ?? true,
      actions: getActions(index),
    })),
  );

  const tour = useTour(() => ({
    id,
    steps: tourSteps,
    closeOnEscape,
    closeOnInteractOutside,
    keyboardNavigation,
    spotlightRadius,
    translations: {
      nextStep: nextLabel,
      prevStep: backLabel,
      close: closeLabel,
      skip: skipLabel,
    },
    onStepChange: (details: TourStepChangeDetails) =>
      onStepChange?.(details.stepIndex),
    onStatusChange: handleStatusChange,
  }));

  function handleStatusChange(details: TourStatusChangeDetails) {
    if (details.status === 'started') {
      open = true;
      return;
    }
    if (details.status === 'dismissed' && tour().lastStep) return;
    open = false;
    if (details.status === 'completed') onComplete?.();
    else if (details.status === 'skipped') onSkip?.();
    else if (details.status === 'dismissed') onDismiss?.();
  }

  $effect(() => {
    if (open && !tour().open) untrack(() => tour().start());
  });

  const actionColorScheme = (action: TourStepAction): ButtonColorScheme => {
    if (action.action === 'skip') return 'ghost';
    if (action.action === 'prev') return 'tertiary';
    return 'primary';
  };
</script>

<ArkTour.Root {tour} lazyMount unmountOnExit>
  <Portal>
    <ArkTour.Backdrop class={tourBackdropRecipe()} />
    <ArkTour.Spotlight class={tourSpotlightRecipe()} />
    <ArkTour.Positioner class={tourPositionerRecipe()}>
      <ArkTour.Content class={tourContentRecipe(className)}>
        <div class={tourHeaderRecipe()}>
          <ArkTour.Title class={tourTitleRecipe()}
            >{tour().step?.title}</ArkTour.Title
          >
          <ArkTour.CloseTrigger>
            {#snippet asChild(props)}
              <Button
                {...props() as TourActionProps}
                colorScheme="ghost"
                size="xs"
                LeadingIcon={IconClose}
                aria-label={closeLabel}
                tracking={false}
              />
            {/snippet}
          </ArkTour.CloseTrigger>
        </div>
        <ArkTour.Description class={tourDescriptionRecipe()}
          >{tour().step?.description}</ArkTour.Description
        >
        <div class={tourFooterRecipe()}>
          {#if showProgress && steps.length > 1}
            <ArkTour.ProgressText class={tourProgressTextRecipe()} />
          {/if}
          <div class={tourActionsRecipe()}>
            <ArkTour.Actions>
              {#snippet children(actions)}
                {#each actions() as action (action.label)}
                  <ArkTour.ActionTrigger {action}>
                    {#snippet asChild(props)}
                      <Button
                        {...props() as TourActionProps}
                        colorScheme={actionColorScheme(action)}
                        size="sm"
                        aria-label={action.label}
                        tracking={false}>{action.label}</Button
                      >
                    {/snippet}
                  </ArkTour.ActionTrigger>
                {/each}
              {/snippet}
            </ArkTour.Actions>
          </div>
        </div>
      </ArkTour.Content>
    </ArkTour.Positioner>
  </Portal>
</ArkTour.Root>

<style>
  @keyframes -global-io-ark-tour-fade-in {
    from {
      opacity: 0;
    }
  }
</style>
