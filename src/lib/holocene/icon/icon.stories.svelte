<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from './';

  import Icon from './icon.svelte';

  const { Story } = defineMeta({
    title: 'Icon',
    component: Icon,
    args: {
      name: 'add',
      height: 24,
      width: 24,
    },
    argTypes: {
      name: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
      height: { name: 'Height', control: 'number' },
      width: { name: 'Width', control: 'number' },
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template({ name, ...args }: Args<typeof Story>)}
  <Icon {name} {...args} />
{/snippet}

<Story name="Default" args={{ name: 'add', height: 24, width: 24 }} />
