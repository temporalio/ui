<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { IconAdd, IconArrowRight } from '$lib/io/icon';
  import {
    Button,
    type ButtonColorScheme,
    ButtonLink,
    type ButtonSize,
  } from '$lib/io-ark/button';

  import ButtonExamples from '../../../examples/button-examples.svelte';
  import examplesSource from '../../../examples/button-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import DocSection from '$docs/components/doc-section.svelte';
  import Playground from '$docs/components/playground.svelte';
  import PropsTable, {
    type PropDefinition,
  } from '$docs/components/props-table.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import { buttonDocumentation } from '$docs/data/components';

  const colorSchemes: ButtonColorScheme[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];
  const sizes: ButtonSize[] = ['xs', 'sm', 'md'];
  let colorScheme = $state<ButtonColorScheme>('primary');
  let size = $state<ButtonSize>('md');
  let label = $state('Create workflow');
  let disabled = $state(false);
  let isLoading = $state(false);
  let leadingIcon = $state(true);
  let presses = $state(0);

  const source = $derived(
    `<script lang="ts">
  import { Button } from '$lib/io-ark/button';${leadingIcon ? "\n  import { IconAdd } from '$lib/io/icon';" : ''}
</` +
      `script>

<Button
  colorScheme="${colorScheme}"
  size="${size}"${leadingIcon ? '\n  LeadingIcon={IconAdd}' : ''}${disabled ? '\n  disabled' : ''}${isLoading ? '\n  isLoading' : ''}
>
  {${JSON.stringify(label)}}
</Button>`,
  );

  const props: PropDefinition[] = [
    [
      'colorScheme',
      'primary | secondary | tertiary | ghost | danger',
      'primary',
      'Visual emphasis and intent.',
    ],
    ['size', 'xs | sm | md', 'md', 'Height, spacing, and icon size.'],
    [
      'LeadingIcon / TrailingIcon',
      'IconComponent | false | null',
      '—',
      'Optional icons before or after the label.',
    ],
    [
      'isLoading',
      'boolean',
      'false',
      'Shows a spinner and sets aria-busy. Does not disable the button.',
    ],
    [
      'disabled',
      'boolean',
      'false',
      'Native disabled behavior. Prevents activation.',
    ],
    [
      'type',
      'button | submit | reset',
      'button',
      'Explicitly opt in to form submission.',
    ],
    [
      'tracking',
      'false | { name?, intent?, text? }',
      'Automatic',
      'Customize analytics attributes or opt out.',
    ],
    ['class', 'string', '—', 'Merge additional Tailwind classes.'],
    ['children', 'Snippet', '—', 'The visible button label.'],
  ];
</script>

<ComponentPage component={buttonDocumentation}>
  <Playground {source} filename="Button.svelte">
    {#snippet preview()}
      <Button
        {colorScheme}
        {size}
        {disabled}
        {isLoading}
        LeadingIcon={leadingIcon ? IconAdd : undefined}
        onclick={() => (presses += 1)}>{label}</Button
      >
      <p role="status" class="text-xs text-secondary">
        Activated {presses}
        {presses === 1 ? 'time' : 'times'}
      </p>
    {/snippet}
    {#snippet controls()}
      <Input id="button-label" label="Label" bind:value={label} />
      <SelectControl
        id="button-color-scheme"
        label="Color scheme"
        options={colorSchemes}
        bind:value={colorScheme}
      />
      <SelectControl
        id="button-size"
        label="Size"
        options={sizes}
        bind:value={size}
      />
      <Checkbox
        id="button-leading-icon"
        label="Leading icon"
        bind:checked={leadingIcon}
      />
      <Checkbox id="button-loading" label="Loading" bind:checked={isLoading} />
      <Checkbox id="button-disabled" label="Disabled" bind:checked={disabled} />
    {/snippet}
  </Playground>

  <DocSection
    id="examples"
    title="A button for every action"
    description="Use one primary action per group. Keep supporting actions quieter."
  >
    <div class="rounded-lg border border-primary p-6">
      <ButtonExamples />
    </div>
    <SourceCode
      code={examplesSource}
      filename="button-examples.svelte"
      collapsible
    />
    <div class="mt-6 grid gap-5 sm:grid-cols-2">
      <div class="rounded-lg border border-primary p-6">
        <h3 class="mb-5 text-sm font-medium">Sizes</h3>
        <div class="flex flex-wrap items-center gap-4">
          {#each sizes as buttonSize (buttonSize)}<Button
              size={buttonSize}
              colorScheme="secondary">{buttonSize}</Button
            >{/each}
        </div>
      </div>
      <div class="rounded-lg border border-primary p-6">
        <h3 class="mb-5 text-sm font-medium">Icon and link actions</h3>
        <div class="flex flex-wrap items-center gap-4">
          <Button LeadingIcon={IconAdd} aria-label="Add workflow" /><ButtonLink
            href="#usage"
            colorScheme="ghost"
            TrailingIcon={IconArrowRight}>Usage guidance</ButtonLink
          >
        </div>
      </div>
    </div>
    <div class="mt-5 rounded-lg border border-primary p-6">
      <h3 class="mb-5 text-sm font-medium">States</h3>
      <div class="flex flex-wrap items-center gap-4">
        <Button>Ready</Button><Button disabled>Unavailable</Button><Button
          isLoading
          disabled>Creating workflow</Button
        >
      </div>
      <p class="mt-4 text-xs text-secondary">
        Loading reports progress. Add disabled explicitly when repeat activation
        should be prevented.
      </p>
    </div>
  </DocSection>

  <DocSection id="usage" title="Use it with intention">
    <div class="grid gap-8 text-sm leading-relaxed sm:grid-cols-2">
      <div>
        <h3 class="mb-2 text-base font-medium">Label the action</h3>
        <p class="text-secondary">
          Start with a verb: “Create workflow” or “Save changes”. Give icon-only
          buttons an aria-label that describes their action.
        </p>
      </div>
      <div>
        <h3 class="mb-2 text-base font-medium">Keep native behavior</h3>
        <p class="text-secondary">
          Button renders a button and supports Enter and Space. Use ButtonLink
          for navigation, and type="submit" for a form’s submit action.
        </p>
      </div>
      <div>
        <h3 class="mb-2 text-base font-medium">Choose emphasis carefully</h3>
        <p class="text-secondary">
          Primary highlights the main action. Secondary and tertiary support it.
          Ghost keeps low-priority actions quiet. Reserve danger for destructive
          actions.
        </p>
      </div>
      <div>
        <h3 class="mb-2 text-base font-medium">Communicate progress</h3>
        <p class="text-secondary">
          Use isLoading and a label such as “Creating workflow” to communicate
          an action in progress. Add disabled when repeated activation should be
          prevented, and announce the result when the action completes.
        </p>
      </div>
    </div>
  </DocSection>

  <DocSection
    id="api"
    title="API reference"
    description="Button also accepts native button attributes and event handlers. ButtonLink accepts anchor attributes and the visual, icon, and tracking props."
  >
    <PropsTable componentName="Button" rows={props} />
  </DocSection>
</ComponentPage>
