<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconClose } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import {
    Tour,
    tourActionsRecipe,
    tourBackdropRecipe,
    tourContentRecipe,
    tourDescriptionRecipe,
    tourFooterRecipe,
    tourHeaderRecipe,
    tourProgressTextRecipe,
    tourSpotlightRecipe,
    type TourStep,
    tourTitleRecipe,
  } from '$lib/io-ark/tour';

  import TourExamples from '../../../examples/tour-examples.svelte';
  import examplesSource from '../../../examples/tour-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('tour');

  let open = $state(false);
  let includeIntro = $state(true);
  let showProgress = $state(true);
  let closeOnEscape = $state(true);
  let nextLabel = $state('Next');
  let finishLabel = $state('Finish');
  let skipLabel = $state('Skip tour');
  let stepIndex = $state(0);
  let namespace = $state<HTMLElement | null>(null);
  let retention = $state<HTMLElement | null>(null);

  const steps: TourStep[] = $derived([
    ...(includeIntro
      ? [
          {
            id: 'intro',
            title: 'Namespace settings',
            description: 'See where to find the settings you change most.',
          },
        ]
      : []),
    {
      id: 'namespace',
      title: 'Current namespace',
      description: 'Settings apply to this namespace only.',
      target: () => namespace,
    },
    {
      id: 'retention',
      title: 'Retention period',
      description:
        'Closed workflow histories are deleted after this many days.',
      target: () => retention,
    },
  ]);

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Tour, type TourStep } from '$lib/io-ark/tour';

  let open = $state(false);
  let namespace = $state<HTMLElement | null>(null);
  let retention = $state<HTMLElement | null>(null);

  const steps: TourStep[] = [${
    includeIntro
      ? `
    {
      id: 'intro',
      title: 'Namespace settings',
      description: 'See where to find the settings you change most.',
    },`
      : ''
  }
    {
      id: 'namespace',
      title: 'Current namespace',
      description: 'Settings apply to this namespace only.',
      target: () => namespace,
    },
    {
      id: 'retention',
      title: 'Retention period',
      description: 'Closed workflow histories are deleted after this many days.',
      target: () => retention,
    },
  ];
</` +
      `script>

<p bind:this={namespace}>payments-prod</p>
<p bind:this={retention}>Retention: 30 days</p>
<Button onclick={() => (open = true)}>Start tour</Button>

<Tour
  {steps}
  bind:open${nextLabel !== 'Next' ? `\n  nextLabel={${JSON.stringify(nextLabel)}}` : ''}${finishLabel !== 'Finish' ? `\n  finishLabel={${JSON.stringify(finishLabel)}}` : ''}${skipLabel !== 'Skip tour' ? `\n  skipLabel={${JSON.stringify(skipLabel)}}` : ''}${!showProgress ? '\n  showProgress={false}' : ''}${!closeOnEscape ? '\n  closeOnEscape={false}' : ''}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={TourExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Tour.svelte">
    {#snippet preview()}
      <div
        class="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-primary bg-background-primary p-4 text-sm"
      >
        <p bind:this={namespace} class="self-start font-mono text-xs">
          payments-prod
        </p>
        <p bind:this={retention} class="self-start">Retention: 30 days</p>
      </div>
      <Button onclick={() => (open = true)}>Start tour</Button>
      <p role="status" class="text-xs text-secondary">
        {open ? `Step ${stepIndex + 1} of ${steps.length}` : 'Tour not running'}
      </p>
      <Tour
        {steps}
        bind:open
        {nextLabel}
        {finishLabel}
        {skipLabel}
        {showProgress}
        {closeOnEscape}
        onStepChange={(index) => (stepIndex = index)}
      />
    {/snippet}
    {#snippet controls()}
      <Input id="tour-next-label" label="Next label" bind:value={nextLabel} />
      <Input
        id="tour-finish-label"
        label="Finish label"
        bind:value={finishLabel}
      />
      <Input id="tour-skip-label" label="Skip label" bind:value={skipLabel} />
      <Checkbox
        id="tour-include-intro"
        label="Intro step"
        bind:checked={includeIntro}
      />
      <Checkbox
        id="tour-show-progress"
        label="Show progress"
        bind:checked={showProgress}
      />
      <Checkbox
        id="tour-close-on-escape"
        label="Close on Escape"
        bind:checked={closeOnEscape}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="relative h-64 w-full overflow-hidden rounded">
      <div class="space-y-3 p-4 pt-16 text-sm text-secondary">
        <p>order-fulfillment-7f3a · Running</p>
        <p>payment-processing-19c2 · Completed</p>
      </div>
      <div
        data-scope="tour"
        data-part="backdrop"
        class="{tourBackdropRecipe()} absolute inset-0"
      ></div>
      <div class="absolute left-4 top-4 z-50 flex flex-col items-start gap-3">
        <span
          data-scope="tour"
          data-part="spotlight"
          class="{tourSpotlightRecipe()} inline-flex rounded"
        >
          <Button size="sm" tracking={false}>Start workflow</Button>
        </span>
        <div
          data-scope="tour"
          data-part="content"
          data-type="tooltip"
          class={tourContentRecipe()}
        >
          <div class={tourHeaderRecipe()}>
            <p data-scope="tour" data-part="title" class={tourTitleRecipe()}>
              Start a workflow
            </p>
            <Button
              data-scope="tour"
              data-part="close-trigger"
              colorScheme="ghost"
              size="xs"
              LeadingIcon={IconClose}
              aria-label="Close tour"
              tracking={false}
            />
          </div>
          <p
            data-scope="tour"
            data-part="description"
            class={tourDescriptionRecipe()}
          >
            Run a new execution on any task queue.
          </p>
          <div class={tourFooterRecipe()}>
            <span
              data-scope="tour"
              data-part="progress-text"
              class={tourProgressTextRecipe()}>2 of 3</span
            >
            <div
              data-scope="tour"
              data-part="actions"
              class={tourActionsRecipe()}
            >
              <Button colorScheme="ghost" size="sm" tracking={false}
                >Skip tour</Button
              >
              <Button colorScheme="tertiary" size="sm" tracking={false}
                >Back</Button
              >
              <Button size="sm" tracking={false}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/snippet}
</ComponentPage>
