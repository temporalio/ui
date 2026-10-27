<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    NavigationMenu,
    type NavigationMenuItem,
    type NavigationMenuOrientation,
  } from '$lib/io-ark/navigation-menu';

  import NavigationMenuExamples from '../../../examples/navigation-menu-examples.svelte';
  import examplesSource from '../../../examples/navigation-menu-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('navigation-menu');

  const orientations: NavigationMenuOrientation[] = ['horizontal', 'vertical'];
  const currentOptions = ['Workflows', 'Schedules', 'Build IDs'] as const;

  let orientation = $state<NavigationMenuOrientation>('horizontal');
  let current = $state<(typeof currentOptions)[number]>('Workflows');
  let label = $state('Main');
  let group = $state(true);
  let value = $state('');

  const items = $derived<NavigationMenuItem[]>([
    {
      label: 'Workflows',
      href: '#workflows',
      current: current === 'Workflows',
    },
    {
      label: 'Schedules',
      href: '#schedules',
      current: current === 'Schedules',
    },
    ...(group
      ? [
          {
            label: 'Deployments',
            children: [
              {
                label: 'Worker deployments',
                href: '#worker-deployments',
              },
              {
                label: 'Build IDs',
                href: '#build-ids',
                current: current === 'Build IDs',
              },
            ],
          },
        ]
      : []),
  ]);

  const source = $derived(
    `<script lang="ts">
  import {
    NavigationMenu,
    type NavigationMenuItem,
  } from '$lib/io-ark/navigation-menu';

  const items: NavigationMenuItem[] = [
    { label: 'Workflows', href: '/workflows'${current === 'Workflows' ? ', current: true' : ''} },
    { label: 'Schedules', href: '/schedules'${current === 'Schedules' ? ', current: true' : ''} },${
      group
        ? `
    {
      label: 'Deployments',
      children: [
        { label: 'Worker deployments', href: '/deployments' },
        { label: 'Build IDs', href: '/build-ids'${current === 'Build IDs' ? ', current: true' : ''} },
      ],
    },`
        : ''
    }
  ];
</` +
      `script>

<NavigationMenu {items}${label ? ` label={${JSON.stringify(label)}}` : ''}${orientation !== 'horizontal' ? ` orientation="${orientation}"` : ''} />`,
  );

  let navigationAnatomyValue = $state('Deployments');
  $effect(() => {
    if (navigationAnatomyValue !== 'Deployments') {
      navigationAnatomyValue = 'Deployments';
    }
  });
</script>

<ComponentPage
  component={documentation}
  examples={NavigationMenuExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="NavigationMenu.svelte">
    {#snippet preview()}
      <div class="flex min-h-48 w-full items-start justify-center">
        <NavigationMenu
          id="navigation-menu-preview"
          {items}
          {label}
          {orientation}
          bind:value
        />
      </div>
      <p role="status" class="text-xs text-secondary">
        Open group: {value || 'none'}
      </p>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="navigation-menu-orientation"
        label="Orientation"
        options={orientations}
        bind:value={orientation}
      />
      <SelectControl
        id="navigation-menu-current"
        label="Current page"
        options={currentOptions}
        bind:value={current}
      />
      <Input id="navigation-menu-label" label="Label" bind:value={label} />
      <Checkbox
        id="navigation-menu-group"
        label="Deployments group"
        bind:checked={group}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="h-52 w-full">
      <NavigationMenu
        id="navigation-menu-anatomy"
        label="Product"
        bind:value={navigationAnatomyValue}
        items={[
          { label: 'Workflows', href: '#workflows', current: true },
          {
            label: 'Deployments',
            children: [
              {
                label: 'Worker deployments',
                href: '#worker-deployments',
                description: 'Versions and ramping',
              },
              { label: 'Build IDs', href: '#build-ids' },
            ],
          },
          { label: 'Schedules', href: '#schedules' },
        ]}
      />
    </div>
  {/snippet}
</ComponentPage>
