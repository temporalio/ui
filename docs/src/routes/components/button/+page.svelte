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
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const colorSchemes: ButtonColorScheme[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];
  const sizes: ButtonSize[] = ['xs', 'sm', 'md'];
  const componentTypes = ['Button', 'ButtonLink'] as const;
  let componentType = $state<(typeof componentTypes)[number]>('Button');
  let href = $state('#usage');
  let colorScheme = $state<ButtonColorScheme>('primary');
  let size = $state<ButtonSize>('md');
  let label = $state('Create workflow');
  let disabled = $state(false);
  let isLoading = $state(false);
  let leadingIcon = $state(true);

  const source = $derived(
    `<script lang="ts">
  import { ${componentType} } from '$lib/io-ark/button';${leadingIcon ? "\n  import { IconAdd } from '$lib/io/icon';" : ''}
</` +
      `script>

<${componentType}${componentType === 'ButtonLink' ? `\n  href={${JSON.stringify(href)}}` : ''}
  colorScheme="${colorScheme}"
  size="${size}"${leadingIcon ? '\n  LeadingIcon={IconAdd}' : ''}${componentType === 'Button' && disabled ? '\n  disabled' : ''}${componentType === 'Button' && isLoading ? '\n  isLoading' : ''}
>
  {${JSON.stringify(label)}}
</${componentType}>`,
  );

  const documentation = getComponentDocumentation('button');
</script>

<ComponentPage
  component={documentation}
  examples={ButtonExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="{componentType}.svelte">
    {#snippet preview()}
      {#if componentType === 'ButtonLink'}
        <ButtonLink
          {href}
          {colorScheme}
          {size}
          LeadingIcon={leadingIcon ? IconAdd : undefined}>{label}</ButtonLink
        >
        <p class="text-xs text-secondary">
          Follow the link to try its destination.
        </p>
      {:else}
        <Button
          {colorScheme}
          {size}
          {disabled}
          {isLoading}
          LeadingIcon={leadingIcon ? IconAdd : undefined}>{label}</Button
        >
      {/if}
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="button-component"
        label="Component"
        options={componentTypes}
        bind:value={componentType}
      />
      <Input id="button-label" label="Label" bind:value={label} />
      {#if componentType === 'ButtonLink'}
        <Input id="button-href" label="href" bind:value={href} />
      {/if}
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
      {#if componentType === 'Button'}
        <Checkbox
          id="button-loading"
          label="Loading"
          bind:checked={isLoading}
        />
        <Checkbox
          id="button-disabled"
          label="Disabled"
          bind:checked={disabled}
        />
      {/if}
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Button LeadingIcon={IconAdd} TrailingIcon={IconArrowRight} tracking={false}
      ><span>Label</span></Button
    >
  {/snippet}
  {#snippet extraExamples()}
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
    </div>
  {/snippet}
</ComponentPage>
