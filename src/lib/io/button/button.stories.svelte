<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { IconAdd, IconChevronDown } from '$lib/io/icon';

  import Button, {
    type ButtonColorScheme,
    type ButtonSize,
  } from './button.svelte';
  import ButtonLink from './link.svelte';

  const colorSchemes: ButtonColorScheme[] = [
    'primary',
    'secondary',
    'tertiary',
    'ghost',
    'danger',
  ];
  const sizes: ButtonSize[] = ['md', 'sm', 'xs'];
  const states = ['default', 'hover', 'active', 'disabled'];

  const { Story } = defineMeta({
    title: 'IO/Components/Button',
    component: Button,
    args: {
      colorScheme: 'primary',
      size: 'md',
      disabled: false,
      isLoading: false,
    },
    argTypes: {
      colorScheme: { control: 'select', options: colorSchemes },
      size: { control: 'select', options: sizes },
      disabled: { control: 'boolean' },
      isLoading: { control: 'boolean' },
      tracking: {
        control: 'object',
        description:
          'Omit for defaults, use false to opt out, or override name, intent, and text.',
      },
      LeadingIcon: {
        control: 'select',
        options: ['None', 'Add'],
        mapping: { None: undefined, Add: IconAdd },
      },
      TrailingIcon: {
        control: 'select',
        options: ['None', 'Chevron down'],
        mapping: { None: undefined, 'Chevron down': IconChevronDown },
      },
      children: { control: false },
      class: { table: { disable: true } },
    },
    parameters: { layout: 'padded' },
  });
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  let isLoading = $state(false);
  let loadingTimeout: ReturnType<typeof setTimeout> | undefined;

  function startLoading() {
    if (isLoading) return;
    isLoading = true;
    loadingTimeout = setTimeout(() => {
      isLoading = false;
      loadingTimeout = undefined;
    }, 2000);
  }

  onDestroy(() => {
    if (loadingTimeout !== undefined) clearTimeout(loadingTimeout);
  });
</script>

{#snippet template(args: ComponentProps<typeof Button>)}
  <div class="bg-background-primary p-6 text-primary">
    <Button {...args}>Button</Button>
  </div>
{/snippet}

<Story name="Playground" {template} />

<Story
  name="Link"
  parameters={{
    controls: {
      include: [
        'colorScheme',
        'size',
        'LeadingIcon',
        'TrailingIcon',
        'tracking',
      ],
    },
  }}
>
  {#snippet template(args)}
    <div
      class="flex flex-wrap items-center gap-4 bg-background-primary p-6 text-primary"
    >
      <ButtonLink
        href="https://docs.temporal.io"
        colorScheme={args.colorScheme}
        size={args.size}
        LeadingIcon={args.LeadingIcon}
        TrailingIcon={args.TrailingIcon}
        tracking={args.tracking}>Documentation</ButtonLink
      >
      <ButtonLink
        href="https://docs.temporal.io"
        target="_blank"
        rel="noopener noreferrer"
        colorScheme={args.colorScheme}
        size={args.size}
        LeadingIcon={args.LeadingIcon}
        TrailingIcon={args.TrailingIcon}
        tracking={args.tracking}>Documentation (new tab)</ButtonLink
      >
    </div>
  {/snippet}
</Story>

<Story name="Color schemes and sizes">
  {#snippet template()}
    <div class="overflow-x-auto bg-background-primary p-6 text-primary">
      <table class="border-separate border-spacing-4">
        <caption class="text-left text-sm text-secondary">
          All color schemes and sizes.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-left text-xs text-secondary">Size</th>
            {#each colorSchemes as colorScheme (colorScheme)}
              <th scope="col" class="text-left text-xs text-secondary">
                {colorScheme}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each sizes as size (size)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary"
                >{size}</th
              >
              {#each colorSchemes as colorScheme (colorScheme)}
                <td><Button {size} {colorScheme}>Button</Button></td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>

<Story name="Icons">
  {#snippet template()}
    <div class="flex flex-col gap-6 bg-background-primary p-6 text-primary">
      {#each sizes as size (size)}
        <div class="flex flex-wrap items-center gap-4">
          <span class="w-6 text-xs text-secondary">{size}</span>
          <Button {size}>Label only</Button>
          <Button {size} LeadingIcon={IconAdd}>Leading icon</Button>
          <Button {size} TrailingIcon={IconChevronDown}>Trailing icon</Button>
          <Button {size} LeadingIcon={IconAdd} TrailingIcon={IconChevronDown}>
            Both icons
          </Button>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Icon only">
  {#snippet template(args)}
    <div class="overflow-x-auto bg-background-primary p-6 text-primary">
      <table class="border-separate border-spacing-4">
        <caption class="text-left text-sm text-secondary">
          Leading and trailing icon-only buttons across all sizes and color
          schemes.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-left text-xs text-secondary">Size</th>
            {#each colorSchemes as colorScheme (colorScheme)}
              <th scope="col" class="text-left text-xs text-secondary">
                {colorScheme}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each sizes as size (size)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary"
                >{size}</th
              >
              {#each colorSchemes as colorScheme (colorScheme)}
                <td>
                  <div class="flex items-center gap-2">
                    <Button
                      {...args}
                      {size}
                      {colorScheme}
                      LeadingIcon={IconAdd}
                      TrailingIcon={undefined}
                      aria-label="Add"
                    />
                    <Button
                      {...args}
                      {size}
                      {colorScheme}
                      LeadingIcon={undefined}
                      TrailingIcon={IconChevronDown}
                      aria-label="Open menu"
                    />
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>

<Story
  name="Loading"
  args={{ isLoading: true, 'aria-busy': true }}
  {template}
/>

{#snippet loadingTemplate(args: ComponentProps<typeof Button>)}
  <div class="bg-background-primary p-6 text-primary">
    <Button
      {...args}
      isLoading={args.isLoading || isLoading}
      disabled={args.disabled || isLoading}
      aria-busy={args.isLoading || isLoading}
      onclick={startLoading}>Click to load</Button
    >
  </div>
{/snippet}

<Story name="Loading with leading icon" args={{ LeadingIcon: IconAdd }}>
  {#snippet template(args)}
    {@render loadingTemplate(args)}
  {/snippet}
</Story>

<Story
  name="Loading with trailing icon"
  args={{ TrailingIcon: IconChevronDown }}
>
  {#snippet template(args)}
    {@render loadingTemplate(args)}
  {/snippet}
</Story>

<Story
  name="Loading with both icons"
  args={{ LeadingIcon: IconAdd, TrailingIcon: IconChevronDown }}
>
  {#snippet template(args)}
    {@render loadingTemplate(args)}
  {/snippet}
</Story>

<Story name="States">
  {#snippet template(args)}
    <div class="overflow-x-auto bg-background-primary p-6 text-primary">
      <table class="border-separate border-spacing-4">
        <caption class="text-left text-sm text-secondary">
          Default, hover, active, and disabled states.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-left text-xs text-secondary">Scheme</th>
            {#each states as state (state)}
              <th scope="col" class="text-left text-xs text-secondary"
                >{state}</th
              >
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each colorSchemes as colorScheme (colorScheme)}
            <tr>
              <th scope="row" class="text-left text-xs text-secondary">
                {colorScheme}
              </th>
              {#each states as state (state)}
                <td>
                  <Button
                    {...args}
                    {colorScheme}
                    disabled={state === 'disabled'}
                    data-state={state === 'hover' || state === 'active'
                      ? state
                      : undefined}>Button</Button
                  >
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</Story>
