<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';
  import { within } from '@storybook/test';

  import DatePicker from '$lib/holocene/date-picker.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';

  /**
   * Used for the "Focused" story to focus the input.
   */
  const focus = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    input.focus();
  };

  const disallowSundays = (date: Date) => date.getDay() !== 0;

  setTemplate(template);
</script>

{#snippet template({
  label,
  todayLabel,
  closeLabel,
  clearLabel,
  ...args
}: Args<typeof Story>)}
  <DatePicker
    {label}
    {todayLabel}
    {closeLabel}
    {clearLabel}
    {...args}
    datechange={action('date-change')}
  />
{/snippet}

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
