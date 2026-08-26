<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { action as logAction } from 'storybook/actions';
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import type { ComponentProps } from 'svelte';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import * as ioIcons from '$lib/io/icon';

  import Button from '../button.svelte';

  import AsyncTest from './async-test.svelte';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  type ComboboxArgs = Omit<
    Partial<ComponentProps<typeof Combobox>>,
    | 'options'
    | 'value'
    | 'optionLabelKey'
    | 'optionValueKey'
    | 'optionDescriptionKey'
    | 'multiselect'
  > & {
    options?: readonly (string | Record<string, unknown>)[];
    optionLabelKey?: string;
    optionValueKey?: string;
    optionDescriptionKey?: string;
    multiselect?: boolean;
    allowCustomValue?: boolean;
    showChevron?: boolean;
    variant?: string;
    value?: unknown;
  };

  const { Story } = defineMeta({
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
      hintText: '',
      LeadingIcon: ioIcons.IconSearch,
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
      hintText: { name: 'Hint Text', control: 'text' },
      valid: { name: 'Valid', control: 'boolean' },
      labelHidden: { name: 'Label Hidden', control: 'boolean' },
      minSize: { name: 'Minimum Size', control: 'number' },
      maxSize: { name: 'Maximum Size', control: 'number' },
      LeadingIcon: {
        name: 'Leading Icon',
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
      },
      noResultsText: { name: 'No Results Text', control: 'text' },
      optionValueKey: { control: 'text', table: { disable: true } },
      optionLabelKey: { control: 'text', table: { disable: true } },
      optionDescriptionKey: { control: 'text', table: { disable: true } },

      options: { table: { disable: true } },
    },
    render: template,
  });
</script>

{#snippet template(args: ComboboxArgs, context: StoryContext<ComboboxArgs>)}
  <Combobox
    {...args as unknown as ComponentProps<typeof Combobox>}
    id={context.id}
    data-testid={context.id}
    onchange={logAction('change')}
  />
{/snippet}

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
  name="With Hint Text"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
    hintText: 'Choose the language used for this workflow.',
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    expect(combobox).toHaveAccessibleDescription(
      'Choose the language used for this workflow.',
    );
  }}
/>

<Story
  name="Error Overrides Hint Text"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
    hintText: 'Choose the language used for this workflow.',
    error: 'Select a language.',
    valid: false,
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    expect(combobox).toHaveAccessibleDescription('Select a language.');
    expect(combobox).not.toHaveAccessibleDescription(
      'Choose the language used for this workflow.',
    );
    expect(
      canvas.queryByText('Choose the language used for this workflow.'),
    ).not.toBeInTheDocument();
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

    // Wait for the listbox to appear since it may have a transition
    const menu = await canvas.findByRole('listbox');

    expect(menu).toBeInTheDocument();
  }}
/>

<Story
  name="Custom Options With Descriptions"
  args={{
    label: 'Select a Namespace',
    options: [
      {
        label: 'billing-prod',
        value: 'billing-prod',
        description: 'Invoicing and payment workflows',
      },
      {
        label: 'billing-staging',
        value: 'billing-staging',
        description: 'Pre-release verification',
      },
      {
        label: 'search-prod',
        value: 'search-prod',
        description: 'Indexing pipeline',
      },
      { label: 'internal-tools', value: 'internal-tools' },
    ],
    optionLabelKey: 'label',
    optionValueKey: 'value',
    optionDescriptionKey: 'description',
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    await userEvent.type(combobox, 'billing');

    const menu = await canvas.findByRole('listbox');
    expect(menu).toBeInTheDocument();

    // Descriptions render as a secondary line beneath the label.
    expect(
      canvas.getByText('Invoicing and payment workflows'),
    ).toBeInTheDocument();

    // An option without a description still renders, with no secondary line.
    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'internal');
    expect(canvas.getByText('internal-tools')).toBeInTheDocument();

    // Filtering matches the label only — never the description.
    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'Indexing');
    await waitFor(() => {
      expect(canvas.getByText('No Results')).toBeInTheDocument();
    });
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

    // Wait for the listbox to appear since it may have a transition
    const menu = await canvas.findByRole('listbox');
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
    // Wait for the listbox to appear since it may have a transition
    const menu = await canvas.findByRole('listbox');
    expect(menu).toBeInTheDocument();
  }}
/>

<Story
  name="Multiselect Without Count Label"
  args={{
    options: ['English', 'German', 'French'],
    multiselect: true,
    displayChips: false,
    value: ['English'],
    numberOfItemsSelectedLabel: () => '',
  }}
  play={async ({ canvasElement }) => {
    expect(canvasElement.querySelectorAll('.rounded-sm.p-1')).toHaveLength(0);
  }}
/>

<Story
  name="Multiselect With Count Label"
  args={{
    options: ['English', 'German', 'French'],
    multiselect: true,
    displayChips: false,
    value: ['English'],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('1 option selected')).toBeInTheDocument();
  }}
/>

<Story
  name="Async Select"
  play={async ({ canvasElement, id, step }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);

    await userEvent.type(combobox, 'one');

    // Wait for the listbox to appear since it may have a transition
    const menu = await canvas.findByRole('listbox');

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
>
  {#snippet template(_args, context)}
    <AsyncTest id={context.id}></AsyncTest>
  {/snippet}
</Story>

<Story
  name="Allow Custom Value"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
    allowCustomValue: true,
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'Spanish');
  }}
/>

<Story
  name="Multiselect Allow Custom Value"
  args={{
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
    multiselect: true,
    value: [],
    allowCustomValue: true,
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'Spanish');
  }}
/>

<Story
  name="Ghost Variant"
  args={{
    variant: 'ghost',
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'English');
  }}
/>

<Story
  name="With Chevron"
  args={{
    showChevron: true,
    options: ['English', 'English (UK)', 'German', 'French', 'Japanese'],
  }}
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.click(combobox);
  }}
/>

<Story
  name="With Action"
  play={async ({ canvasElement, id }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByTestId(id);
    await userEvent.type(combobox, 'E');
  }}
>
  {#snippet template(args, context)}
    <div class="w-64">
      <Combobox
        {...args as unknown as ComponentProps<typeof Combobox>}
        id={context.id}
        data-testid={context.id}
        onchange={logAction('change')}
        LeadingIcon={ioIcons.IconSearch}
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
      >
        {#snippet action()}
          <Button
            onclick={() => {}}
            variant="ghost"
            size="xs"
            LeadingIcon={ioIcons.IconClose}
            aria-label="clear"
          />
        {/snippet}
      </Combobox>
    </div>
  {/snippet}
</Story>
