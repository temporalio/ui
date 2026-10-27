<script lang="ts">
  import { onMount } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io-ark/button';
  import {
    createIoToaster,
    Toaster,
    type ToastStatusType,
  } from '$lib/io-ark/toast';

  import ToastExamples from '../../../examples/toast-examples.svelte';
  import examplesSource from '../../../examples/toast-examples.svelte?raw';

  import AnatomySection from '$docs/components/anatomy-section.svelte';
  import ComponentPage from '$docs/components/component-page.svelte';
  import ContractSection from '$docs/components/contract-section.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import MarkdownContent from '$docs/components/markdown-content.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import {
    getComponentContent,
    getComponentDocumentation,
  } from '$docs/data/components';

  const content = getComponentContent('toast');
  const documentation = getComponentDocumentation('toast');

  const toaster = createIoToaster();
  const anatomyToaster = createIoToaster({ placement: 'bottom-start' });

  onMount(() => {
    const timer = setTimeout(() =>
      anatomyToaster.create({
        type: 'success',
        title: 'Workflow started',
        description: 'order-fulfillment-7f3a is running.',
        action: { label: 'View', onClick: () => {} },
      }),
    );
    return () => clearTimeout(timer);
  });

  const types: ToastStatusType[] = [
    'success',
    'info',
    'warning',
    'error',
    'loading',
  ];
  const durations = ['3000', '5000', '10000', 'Infinity'] as const;

  let type = $state<ToastStatusType>('success');
  let title = $state('Workflow started');
  let description = $state('order-fulfillment-7f3a is running.');
  let duration = $state<(typeof durations)[number]>('5000');
  let withAction = $state(false);
  let closable = $state(true);

  function show() {
    toaster.create({
      type,
      title,
      description: description || undefined,
      ...(duration !== '5000' ? { duration: Number(duration) } : {}),
      closable,
      action: withAction ? { label: 'View', onClick: () => {} } : undefined,
    });
  }

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Toaster, toaster } from '$lib/io-ark/toast';
</` +
      `script>

<Toaster />

<Button
  onclick={() =>
    toaster.create({
      type: '${type}',
      title: ${JSON.stringify(title)},${description ? `\n      description: ${JSON.stringify(description)},` : ''}${duration !== '5000' ? `\n      duration: ${duration},` : ''}${!closable ? '\n      closable: false,' : ''}${withAction ? "\n      action: { label: 'View', onClick: () => goto('/workflows') }," : ''}
    })}
>
  Show toast
</Button>`,
  );
</script>

<Toaster {toaster} />

<ComponentPage component={documentation}>
  <Playground {source} filename="Toast.svelte">
    {#snippet preview()}
      <Button onclick={show}>Show toast</Button>
      <p class="text-xs text-secondary">Toasts appear at the bottom right.</p>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="toast-type"
        label="Type"
        options={types}
        bind:value={type}
      />
      <Input id="toast-title" label="Title" bind:value={title} />
      <Input
        id="toast-description"
        label="Description"
        bind:value={description}
      />
      <SelectControl
        id="toast-duration"
        label="Duration (ms)"
        options={durations}
        bind:value={duration}
      />
      <Checkbox id="toast-action" label="Action" bind:checked={withAction} />
      <Checkbox id="toast-closable" label="Closable" bind:checked={closable} />
    {/snippet}
  </Playground>
  <AnatomySection slug="toast">
    {#snippet preview()}
      <div class="h-36 w-full">
        <Toaster
          toaster={anatomyToaster}
          label="Anatomy notifications"
          class="!transition-none"
        />
      </div>
    {/snippet}
  </AnatomySection>
  <DocSection id="examples" title={content.sections.examples.title}>
    <MarkdownContent section={content.sections.examples} />
    <div class="mt-5">
      <div class="rounded-lg border border-primary p-6">
        <ToastExamples />
      </div>
      <SourceCode
        code={examplesSource}
        filename="toast-examples.svelte"
        collapsible
      />
    </div>
  </DocSection>
  <DocSection id="usage" title={content.sections.usage.title}>
    <MarkdownContent section={content.sections.usage} />
  </DocSection>
  <ContractSection slug="toast" />
  <DocSection id="api" title={content.sections.api.title}>
    <MarkdownContent section={content.sections.api} />
  </DocSection>
</ComponentPage>
