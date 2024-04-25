<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import Search from './search.svelte';

  export const meta = {
    title: 'Search',
    component: Search,
    args: {
      placeholder: 'Search',
      value: '',
      disabled: false,
      icon: false,
    },
    argTypes: {
      placeholder: { control: 'text' },
      value: { control: 'text' },
      icon: { control: 'boolean' },
      disabled: { control: 'boolean' },
    },
  } satisfies Meta<Search>;
</script>

<Template let:args let:context>
  <Search {...args} id={context.id} />
</Template>

<Story name="Light" />

<Story
  name="Dark"
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>
