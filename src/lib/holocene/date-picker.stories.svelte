<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import DatePicker from '$lib/holocene/date-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
    action('datechange')(d);
  };
</script>

<Meta
  title="Date Picker"
  component={DatePicker}
  argTypes={{
    selected: { control: false },
    label: { control: 'text' },
    todayLabel: { control: 'text' },
    closeLabel: { control: 'text' },
    clearLabel: { control: 'text' },
  }}
/>

<Story name="date picker" let:args>
  <DatePicker
    label="Pick a Date"
    todayLabel="Today"
    closeLabel="Close"
    clearLabel="Clear"
    on:datechange={onDateChange}
    selected={currentDate}
    {...args}
  />
</Story>
