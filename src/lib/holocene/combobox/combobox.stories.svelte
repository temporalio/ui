<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';
  import { expect, userEvent, waitFor, within } from '@storybook/test';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { iconNames } from '$lib/holocene/icon';

  export const meta = {
    title: 'Combobox',
    component: Combobox,
    args: {
      label: 'Select a Language',
      placeholder: 'Start Typing...',
      noResultsText: 'No Results',
      readonly: false,
      required: false,
      disabled: false,
      valid: true,
      error: '',
      leadingIcon: 'search',
      labelHidden: false,
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      value: { name: 'Value', control: 'text', table: { disable: true } },
      placeholder: { name: 'Placeholder', control: 'text' },
      readonly: { name: 'Read Only', control: 'boolean' },
      required: { name: 'Required', control: 'boolean' },
      disabled: { name: 'Disabled', control: 'boolean' },
      error: { name: 'Error', control: 'text' },
      valid: { name: 'Valid', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      minSize: { name: 'Minimum Size', control: 'number' },
      maxSize: { name: 'Maximum Size', control: 'number' },
      leadingIcon: {
        name: 'Icon',
        control: 'select',
        options: iconNames,
      },
      noResultsText: { name: 'No Results Text', control: 'text' },
      optionValueKey: { control: 'text', table: { disable: true } },
      optionLabelKey: { control: 'text', table: { disable: true } },

      options: { table: { disable: true } },
    },
  } satisfies Meta<Combobox<unknown>>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Button from '../button.svelte';

  import AsyncTest from './async-test.svelte';
</script>

<Template let:args let:context>
  <Combobox
    id={context.id}
    data-testid={context.id}
    on:change={action('change')}
    on:filter={action('filter')}
    {...args}
  />
</Template>

<Story
  name="String Options"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'English');
  }}
/>

<Story
  name="Custom Options"
  args={{
    options: [
      { label: 'English', value: 'en-us' },
      { label: 'English (UK)', value: 'en-uk' },
      { label: 'German', value: 'de' },
      { label: 'French', value: 'fr' },
      { label: 'Japanese', value: 'jp' },
    ],
    optionLabelKey: 'label',
    optionValueKey: 'value',
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    await userEvent.type(combobox, 'Japanese');

    const menu = canvas.getByRole('listbox');

    expect(menu).toBeInTheDocument();
  }}
/>

<Story
  name="No Results"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    await userEvent.type(combobox, 'Jerseyan');

    const menu = canvas.getByRole('listbox');
    const noResults = canvas.getByText('No Results');

    expect(menu).toBeInTheDocument();
    expect(noResults).toBeInTheDocument();
  }}
/>

<Story
  name="Multiselect"
  args={{
    options: [
      'English',
      'English (UK)',
      'German',
      'French',
      'Japanese',
      'Spanish',
      'Portuguese',
    ],
    multiselect: true,
    value: [],
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'E');
    const menu = canvas.getByRole('listbox');
    expect(menu).toBeInTheDocument();
  }}
/>

<Story
  name="Async Select"
  play={async ({ canvasElement, id, step }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    await userEvent.type(combobox, 'one');

    const menu = canvas.getByRole('listbox');

    expect(menu).toBeInTheDocument();

    await step('Check async results', async () => {
      expect(canvas.getByText('one')).toBeInTheDocument();
      expect(canvas.getByText('Loading more results')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(canvas.getByText('asyncone')).toBeInTheDocument();
        },
        { timeout: 2001 },
      );
    });

    await step('Get no results', async () => {
      await userEvent.type(combobox, 'omgnoresults');
      expect(canvas.getByText('Loading more results')).toBeInTheDocument();
      waitFor(
        () => {
          expect(canvas.getByText('No Results')).toBeInTheDocument();
        },
        { timeout: 2001 },
      );
    });
  }}
  let:context
>
  <AsyncTest id={context.id}></AsyncTest>
</Story>

<Story
  name="With Action"
  let:args
  let:context
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'E');
  }}
>
  <div class="w-64">
    <Combobox
      id={context.id}
      data-testid={context.id}
      on:change={action('change')}
      on:filter={action('filter')}
      leadingIcon="search"
      options={[
        'English',
        'English (UK)',
        'German',
        'French',
        'Japanese',
        'Spanish',
        'Portuguese',
        'Mandarin',
        'Hindi',
        'Russian',
        'Italian',
      ]}
      {...args}
    >
      <Button
        on:click={() => {}}
        slot="action"
        variant="ghost"
        size="xs"
        leadingIcon="close"
        aria-label="clear"
      />
    </Combobox>
  </div>
</Story>
