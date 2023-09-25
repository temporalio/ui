<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';

  import Button from '$lib/holocene/button.svelte';
  import { type IconName, icons } from '$lib/holocene/icon/paths';

  let disabled = false;
  let variant: 'primary' | 'secondary' | 'destructive' | 'ghost' = 'primary';
  let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  let borderModifier: 'borderless' | 'borderless-left' | 'borderless-right';
  let borderRadiusModifier: 'square' | 'square-left' | 'square-right';
  let loading = false;
  let href: string;
  let leadingIcon: IconName;
  let trailingIcon: IconName;
  let count: number;

  export let Hst: HST;
</script>

<Hst.Story title="button">
  <Hst.Variant title="A Regular Button">
    <div class="flex items-center justify-center p-4">
      <Button
        {variant}
        {size}
        {borderModifier}
        {borderRadiusModifier}
        {disabled}
        {loading}
        {leadingIcon}
        {trailingIcon}
        {count}>Click Me</Button
      >
    </div>
  </Hst.Variant>

  <Hst.Variant title="A Button with an href">
    <div class="flex items-center justify-center p-4">
      <Button
        href="https://temporal.io"
        target="_blank"
        {variant}
        {size}
        {borderModifier}
        {borderRadiusModifier}
        {loading}
        {leadingIcon}
        {trailingIcon}
        {count}
      >
        A Link
      </Button>
    </div>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Select
      bind:value={variant}
      title="Variant"
      options={['primary', 'secondary', 'destructive', 'ghost']}
    />
    <Hst.Select
      bind:value={size}
      title="Size"
      options={['xs', 'sm', 'md', 'lg']}
    />
    <Hst.Select
      bind:value={leadingIcon}
      title="Leading Icon"
      options={[{ label: 'None', value: '' }, ...Object.keys(icons)]}
    />
    <Hst.Select
      bind:value={trailingIcon}
      title="Trailing Icon"
      options={[{ label: 'None', value: '' }, ...Object.keys(icons)]}
    />
    <Hst.Select
      bind:value={borderModifier}
      title="Border Modifier"
      options={[
        { label: 'None', value: '' },
        'borderless',
        'borderless-left',
        'borderless-right',
      ]}
    />
    <Hst.Select
      bind:value={borderRadiusModifier}
      title="Border Radius Modifier"
      options={[
        { label: 'None', value: '' },
        'square',
        'square-left',
        'square-right',
      ]}
    />
    <Hst.Text bind:value={href} title="Href" />
    <Hst.Number bind:value={count} title="Count" />
    <Hst.Checkbox bind:value={disabled} title="Disabled" />
    <Hst.Checkbox bind:value={loading} title="Loading" />
  </svelte:fragment>
</Hst.Story>
