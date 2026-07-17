<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';

  const { Story } = defineMeta({
    title: 'Button Radio Group',
    component: ButtonRadioGroup,
    args: {
      label: 'Recurrence',
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      value: { table: { disable: true } },
      options: { table: { disable: true } },
      onChange: { table: { disable: true } },
      item: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import type {
    ButtonRadioItem,
    ButtonRadioOption,
  } from '$lib/holocene/button-radio-group.svelte';
  import Button, { type ButtonStyles } from '$lib/holocene/button.svelte';

  type StoryArgs = ComponentProps<
    typeof ButtonRadioGroup<ButtonRadioOption<string>>
  >;

  const options: ButtonRadioOption<string>[] = [
    { label: 'Every day', value: 'everyday' },
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekends', value: 'weekends' },
    { label: 'Custom days', value: 'custom' },
  ];

  const optionsWithDisabled: ButtonRadioOption<string>[] = [
    { label: 'Every day', value: 'everyday' },
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekends', value: 'weekends', disabled: true },
    { label: 'Custom days', value: 'custom' },
  ];

  let value = $state('everyday');
</script>

{#snippet radioButton(
  {
    option,
    checked,
    attrs,
    onSelect,
    onKeydown,
  }: ButtonRadioItem<ButtonRadioOption<string>>,
  variant: ButtonStyles['variant'] = 'secondary',
  size: ButtonStyles['size'] = 'md',
)}
  <Button
    {variant}
    {size}
    active={checked}
    {...attrs}
    on:click={onSelect}
    on:keydown={onKeydown}
  >
    {option.label}
  </Button>
{/snippet}

<Story name="Default">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup {...args} {options} {value} onChange={(n) => (value = n)}>
      {#snippet item(radioItem)}
        {@render radioButton(radioItem)}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>

<Story name="Small">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup {...args} {options} {value} onChange={(n) => (value = n)}>
      {#snippet item(radioItem)}
        {@render radioButton(radioItem, 'secondary', 'sm')}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>

<Story name="Large">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup {...args} {options} {value} onChange={(n) => (value = n)}>
      {#snippet item(radioItem)}
        {@render radioButton(radioItem, 'secondary', 'lg')}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>

<Story name="Primary">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup {...args} {options} {value} onChange={(n) => (value = n)}>
      {#snippet item(radioItem)}
        {@render radioButton(radioItem, 'primary')}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>

<Story name="Ghost">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup {...args} {options} {value} onChange={(n) => (value = n)}>
      {#snippet item(radioItem)}
        {@render radioButton(radioItem, 'ghost')}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>

<Story name="With Disabled Option">
  {#snippet template(args: StoryArgs)}
    <ButtonRadioGroup
      {...args}
      options={optionsWithDisabled}
      {value}
      onChange={(n) => (value = n)}
    >
      {#snippet item(radioItem)}
        {@render radioButton(radioItem)}
      {/snippet}
    </ButtonRadioGroup>
  {/snippet}
</Story>
