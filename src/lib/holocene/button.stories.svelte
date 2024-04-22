<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Button from '$lib/holocene/button.svelte';
  import iconNames from '$lib/holocene/icon';

  export const meta = {
    title: 'Button',
    component: Button,
    args: {
      variant: 'Primary',
      size: 'Medium',
      loading: false,
      disabled: false,
      active: false,
    },
    argTypes: {
      variant: {
        control: 'select',
        options: ['Primary', 'Secondary', 'Destructive', 'Ghost'],
        mapping: {
          Primary: 'primary',
          Secondary: 'secondary',
          Destructive: 'destructive',
          Ghost: 'ghost',
        },
      },
      size: {
        control: 'select',
        options: ['Extra Small', 'Small', 'Medium', 'Large'],
        mapping: {
          'Extra Small': 'xs',
          Small: 'sm',
          Medium: 'md',
          Large: 'lg',
        },
      },
      loading: { control: 'boolean' },
      count: { control: { type: 'number', min: 0, max: 99, step: 1 } },
      icon: {
        control: { type: 'select', options: iconNames },
        table: {
          category: 'Icon',
        },
      },
      leadingIcon: {
        control: { type: 'select', options: iconNames },
        table: {
          category: 'Icon',
        },
      },
      trailingIcon: {
        control: { type: 'select', options: iconNames },
        table: {
          category: 'Icon',
        },
      },
      href: {
        control: 'text',
        table: {
          category: 'Link',
        },
      },
      target: {
        control: 'select',
        options: ['_blank', '_self', '_parent', '_top'],
        table: {
          category: 'Link',
        },
        if: { arg: 'href' },
      },
      borderModifier: {
        control: 'select',
        options: ['borderless', 'borderless-left', 'borderless-right'],
        table: {
          category: 'Modifiers',
        },
      },
      borderRadiusModifier: {
        control: 'select',
        options: ['square', 'square-left', 'square-right'],
        table: {
          category: 'Modifiers',
        },
      },
      id: {
        control: 'text',
        table: {
          disable: true,
        },
      },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Button {...args} on:click={action('click')}>Click Me</Button>
</Template>

<Story name="Primary" args={{}} />

<Story name="Secondary" args={{ variant: 'Secondary' }} />

<Story name="Destructive" args={{ variant: 'Destructive' }} />

<Story name="Ghost" args={{ variant: 'Ghost' }} />

<Story name="Extra Small" args={{ size: 'Extra Small' }} />

<Story name="Small" args={{ size: 'Small' }} />

<Story name="Large" args={{ size: 'Large' }} />

<Story name="Loading" args={{ loading: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Active" args={{ active: true }} />

<Story name="With Count" args={{ count: 5 }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

<Story name="With Leading Icon" args={{ leadingIcon: 'workflow' }} />

<Story name="With Trailing Icon" args={{ trailingIcon: 'workflow' }} />

<Story name="With Link" args={{ href: 'https://example.com' }} />

<Story name="Borderless" args={{ borderModifier: 'borderless' }} />

<Story name="Borderless Left" args={{ borderModifier: 'borderless-left' }} />

<Story name="Borderless Right" args={{ borderModifier: 'borderless-right' }} />

<Story name="Square" args={{ borderRadiusModifier: 'square' }} />

<Story name="Square Left" args={{ borderRadiusModifier: 'square-left' }} />

<Story name="Square Right" args={{ borderRadiusModifier: 'square-right' }} />

<Story
  name="Primary (Dark)"
  args={{}}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Secondary (Dark)"
  args={{ variant: 'Secondary' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Destructive (Dark)"
  args={{ variant: 'Destructive' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Ghost (Dark)"
  args={{ variant: 'Ghost' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Extra Small (Dark)"
  args={{ size: 'Extra Small' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Small (Dark)"
  args={{ size: 'Small' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Large (Dark)"
  args={{ size: 'Large' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Loading (Dark)"
  args={{ loading: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Active (Dark)"
  args={{ active: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Count (Dark)"
  args={{ count: 5 }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Icon (Dark)"
  args={{ icon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Leading Icon (Dark)"
  args={{ leadingIcon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Trailing Icon (Dark)"
  args={{ trailingIcon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Link (Dark)"
  args={{ href: 'https://example.com' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Borderless (Dark)"
  args={{ borderModifier: 'borderless' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Borderless Left (Dark)"
  args={{ borderModifier: 'borderless-left' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Borderless Right (Dark)"
  args={{ borderModifier: 'borderless-right' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Square (Dark)"
  args={{ borderRadiusModifier: 'square' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Square Left (Dark)"
  args={{ borderRadiusModifier: 'square-left' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Square Right (Dark)"
  args={{ borderRadiusModifier: 'square-right' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>
