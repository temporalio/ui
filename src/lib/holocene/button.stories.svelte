<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import * as ioIcons from '$lib/io/icon';

  import { shouldNotBeTransparent } from './test-utilities';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
    title: 'Button',
    component: Button,
    args: {
      variant: 'primary',
      size: 'md',
      loading: false,
      disabled: false,
    },
    argTypes: {
      variant: {
        name: 'Variant',
        control: 'select',
        options: ['primary', 'secondary', 'destructive', 'ghost'],
      },
      size: {
        name: 'Size',
        control: 'select',
        options: ['xs', 'sm', 'md', 'lg'],
      },
      loading: {
        name: 'Loading',
        control: 'boolean',
      },
      count: {
        name: 'Count',
        control: { type: 'number', min: 0, max: 99, step: 1 },
      },
      LeadingIcon: {
        name: 'Leading Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
        table: {
          category: 'Icon',
        },
      },
      TrailingIcon: {
        name: 'Trailing Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
        table: {
          category: 'Icon',
        },
      },
      href: {
        name: 'Link',
        control: 'text',
        table: {
          category: 'Link',
        },
      },
      target: {
        name: 'Link Target',
        control: 'select',
        options: ['_blank', '_self', '_parent', '_top'],
        table: {
          category: 'Link',
        },
        if: { arg: 'href' },
      },
      id: {
        name: 'ID',
        control: 'text',
        table: {
          disable: true,
        },
      },
    },
  });
</script>

<script lang="ts">
  let loading = $state(false);
</script>

{#snippet template(args: ComponentProps<typeof Button>)}
  <Button {...args} onclick={action('click')}>Click Me</Button>
{/snippet}

<Story name="Primary" args={{}} {template} />

<Story name="With Long Title">
  {#snippet template(args)}
    <div class="max-w-16">
      <Button {...args} onclick={action('click')}>Request Cancellation</Button>
    </div>
  {/snippet}
</Story>

<Story name="Button Group">
  {#snippet template(args)}
    <div class="button-group flex">
      <Button {...args} onclick={action('click')}>First</Button>
      <Button {...args} onclick={action('click')}>Middle</Button>
      <Button {...args} onclick={action('click')}>Last</Button>
    </div>
  {/snippet}
</Story>

<Story
  name="Secondary"
  args={{ variant: 'secondary' }}
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('button'))}
  {template}
/>

<Story name="Destructive" args={{ variant: 'destructive' }} {template} />

<Story name="Ghost" args={{ variant: 'ghost' }} {template} />

<Story name="Extra Small" args={{ size: 'xs' }} {template} />

<Story name="Small" args={{ size: 'sm' }} {template} />

<Story name="Large" args={{ size: 'lg' }} {template} />

<Story name="Loading" args={{ loading: true }} {template} />

<Story name="Disabled" args={{ disabled: true }} {template} />

<Story name="Active" args={{ active: true }} {template} />

<Story name="With Count" args={{ count: 5 }} {template} />

<Story
  name="With Leading Icon"
  args={{ LeadingIcon: ioIcons.IconTemporalWorkflow }}
  {template}
/>

<Story
  name="With Trailing Icon"
  args={{ TrailingIcon: ioIcons.IconTemporalWorkflow }}
  {template}
/>

<Story name="With Link" args={{ href: 'https://example.com' }} {template} />

<Story name="With Leading Icon & Loading">
  {#snippet template(args)}
    <Button
      {...args}
      LeadingIcon={ioIcons.IconTemporal}
      {loading}
      onclick={() => {
        loading = true;
        setTimeout(() => {
          loading = false;
        }, 2000);
      }}
    >
      Click me for Loading
    </Button>
  {/snippet}
</Story>

<Story name="With Trailing Icon & Loading">
  {#snippet template(args)}
    <Button
      {...args}
      TrailingIcon={ioIcons.IconTemporal}
      {loading}
      onclick={() => {
        loading = true;
        setTimeout(() => {
          loading = false;
        }, 2000);
      }}>Click me for Loading</Button
    >
  {/snippet}
</Story>

<Story name="With Trailing and Leading Icon & Loading">
  {#snippet template(args)}
    <Button
      {...args}
      TrailingIcon={ioIcons.IconTemporal}
      LeadingIcon={ioIcons.IconTemporal}
      {loading}
      onclick={() => {
        loading = true;
        setTimeout(() => {
          loading = false;
        }, 2000);
      }}>Click me for Loading</Button
    >
  {/snippet}
</Story>
