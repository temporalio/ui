<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';
  import { within } from '@storybook/test';

  import DatePicker from '$lib/anthropocene/date-picker.svelte';

  export const meta = {
    title: 'Date Picker',
    component: DatePicker,
    args: {
      label: 'Pick a Date',
      todayLabel: 'Today',
      closeLabel: 'Close',
      clearLabel: 'Clear',
      disabled: false,
      labelHidden: false,
      selected: new Date('2012-09-19T08:03:00-05:00'),
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      labelHidden: { name: 'Hide Label', control: 'boolean' },
      selected: { name: 'Selected Date', control: 'date' },
      isAllowed: { table: { disable: true } },
      disabled: { name: 'Disabled', control: 'boolean' },
      todayLabel: {
        name: 'Today',
        control: 'text',
        table: { category: 'Accessibility' },
      },
      closeLabel: {
        name: 'Close',
        control: 'text',
        table: { category: 'Accessibility' },
      },
      clearLabel: {
        name: 'Clear',
        control: 'text',
        table: { category: 'Accessibility' },
      },
    },
  } satisfies Meta<DatePicker>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  /**
   * Used for the "Focused" story to focus the input.
   */
  const focus = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    input.focus();
  };

  const disallowSundays = (date: Date) => date.getDay() !== 0;
</script>

<Template let:args>
  <DatePicker {...args} on:datechange={action('date-change')} />
</Template>

<Story name="Default" play={focus} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story
  name="Disallowed Dates"
  args={{
    selected: new Date('2012-09-19'),
    isAllowed: disallowSundays,
  }}
  play={focus}
/>
