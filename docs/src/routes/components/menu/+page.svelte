<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import type { ButtonColorScheme } from '$lib/io-poc/button';
  import { Menu, type MenuEntry, type MenuPlacement } from '$lib/io-poc/menu';

  import MenuExamples from '../../../examples/menu-examples.svelte';
  import examplesSource from '../../../examples/menu-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('menu');

  const anatomyItems: MenuEntry[] = [
    {
      type: 'group',
      label: 'Workflow',
      items: [
        { value: 'signal', label: 'Send signal' },
        { value: 'query', label: 'Query' },
      ],
    },
    { type: 'separator' },
    { value: 'terminate', label: 'Terminate', danger: true },
  ];

  const placements: MenuPlacement[] = [
    'bottom-start',
    'bottom',
    'bottom-end',
    'top-start',
    'top-end',
    'right-start',
    'left-start',
  ];
  const colorSchemes: ButtonColorScheme[] = [
    'tertiary',
    'secondary',
    'primary',
    'ghost',
  ];

  let label = $state('Actions');
  let placement = $state<MenuPlacement>('bottom-start');
  let triggerColorScheme = $state<ButtonColorScheme>('tertiary');
  let closeOnSelect = $state(true);
  let disabled = $state(false);
  let includeDanger = $state(true);
  let selected = $state('None');

  const items: MenuEntry[] = $derived([
    { value: 'signal', label: 'Send signal' },
    { value: 'query', label: 'Query' },
    { value: 'reset', label: 'Reset' },
    ...(includeDanger
      ? ([
          { type: 'separator' },
          { value: 'terminate', label: 'Terminate', danger: true },
        ] satisfies MenuEntry[])
      : []),
  ]);

  const source = $derived(
    `<script lang="ts">
  import { Menu, type MenuEntry } from '$lib/io-poc/menu';

  const items: MenuEntry[] = [
    { value: 'signal', label: 'Send signal' },
    { value: 'query', label: 'Query' },
    { value: 'reset', label: 'Reset' },${includeDanger ? "\n    { type: 'separator' },\n    { value: 'terminate', label: 'Terminate', danger: true }," : ''}
  ];
</` +
      `script>

<Menu
  label={${JSON.stringify(label)}}
  {items}${placement !== 'bottom-start' ? `\n  placement="${placement}"` : ''}${triggerColorScheme !== 'tertiary' ? `\n  triggerColorScheme="${triggerColorScheme}"` : ''}${!closeOnSelect ? '\n  closeOnSelect={false}' : ''}${disabled ? '\n  disabled' : ''}
  onSelect={(value) => console.log(value)}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={MenuExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Menu.svelte">
    {#snippet preview()}
      <Menu
        id="menu-preview"
        {label}
        {items}
        {placement}
        {triggerColorScheme}
        {closeOnSelect}
        {disabled}
        onSelect={(value) => (selected = value)}
      />
      <p role="status" class="text-xs text-secondary">Selected: {selected}</p>
    {/snippet}
    {#snippet controls()}
      <Input id="menu-label" label="Label" bind:value={label} />
      <SelectControl
        id="menu-placement"
        label="Placement"
        options={placements}
        bind:value={placement}
      />
      <SelectControl
        id="menu-trigger-color-scheme"
        label="Trigger color scheme"
        options={colorSchemes}
        bind:value={triggerColorScheme}
      />
      <Checkbox
        id="menu-danger"
        label="Danger item"
        bind:checked={includeDanger}
      />
      <Checkbox
        id="menu-close-on-select"
        label="Close on select"
        bind:checked={closeOnSelect}
      />
      <Checkbox id="menu-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="h-64 w-[320px]">
      <Menu
        id="menu-anatomy"
        label="Actions"
        items={anatomyItems}
        open
        portalled={false}
        closeOnInteractOutside={false}
        closeOnEscape={false}
      />
    </div>
  {/snippet}
</ComponentPage>
