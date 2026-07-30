<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

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
    render: template,
  });

  /**
   * Used for the "Focused" story to focus the input.
   */
  const focus = (canvasElement: HTMLElement) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    input.focus();
  };

  const disallowSundays = (date: Date) => date.getDay() !== 0;
</script>

{#snippet template(args: ComponentProps<typeof DatePicker>)}
  <DatePicker {...args} onDateChange={action('date-change')} />
{/snippet}

<Story
  name="Default"
  play={async ({ canvasElement }) => focus(canvasElement)}
/>

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Hidden Label" args={{ labelHidden: true }} />

<Story
  name="Disallowed Dates"
  args={{
    selected: new Date('2012-09-19'),
    isAllowed: disallowSundays,
  }}
  play={async ({ canvasElement }) => focus(canvasElement)}
/>
