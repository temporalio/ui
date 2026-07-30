<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import DurationInput from './duration-input.svelte';

  export { template };

  const { Story } = defineMeta({
    title: 'Duration Input',
    component: DurationInput,
    render: template,
    argTypes: {
      value: { control: false },
      units: { control: false },
      initialUnit: { control: false },
    },
    args: {
      value: '',
      id: 'duration-input',
      label: 'Duration',
      required: false,
    },
  });

  type Args = ComponentProps<
    DurationInput<string, { label: string; convert: (n: number) => number }[]>
  >;
</script>

{#snippet template(args: Args)}
  <DurationInput
    {...args}
    bind:value={args.value}
    hintText="Value: {args.value}"
  />
{/snippet}

<Story name="With default units" />

<Story
  name="With custom units"
  args={{
    units: [
      { label: 'Nanosecond(s)', convert: (n) => n / Math.pow(10, 9) },
      { label: 'Day(s)', convert: (n) => n * 86400 },
      { label: 'Week(s)', convert: (n) => n * 604800 },
    ],
    initialUnit: 'Day(s)',
  }}
/>
