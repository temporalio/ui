<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { type IconName, iconNames } from './';

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

<Story name="Default" args={{ name: 'add', height: 24, width: 24 }}>
  {#snippet template(args: ComponentProps<typeof Icon>)}
    <Icon {...args} />
  {/snippet}
</Story>

<Story name="All Icons">
  {#snippet template()}
    <div
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;"
    >
      {#each iconNames as name (name)}
        {@const iconName = name as IconName}
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;"
        >
          <Icon name={iconName} height={24} width={24} />
          <span style="font-size: 12px; word-break: break-all;">{name}</span>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
