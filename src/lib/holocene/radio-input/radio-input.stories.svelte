<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
    type StoryContext,
  } from '@storybook/addon-svelte-csf';

  import RadioGroup from './radio-group.svelte';
  import RadioInput from './radio-input.svelte';

  const { Story } = defineMeta({
    title: 'Radio Input',
    component: RadioInput,
    args: {
      label: 'Radio Input Label',
      value: 'checked',
      description: '',
      checked: false,
      disabled: false,
      required: false,
      labelHidden: false,
      name: 'options',
    },
    argTypes: {
      label: { name: 'Label', control: 'text' },
      description: { name: 'Description', control: 'text' },
      value: { table: { disable: true } },
      checked: { table: { disable: true } },
      disabled: { table: { disable: true } },
      required: { table: { disable: true } },
      labelHidden: { table: { disable: true } },
      group: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  import { shouldNotBeTransparent } from '../test-utilities';

  const loremIpsum =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.';
  setTemplate(template);
</script>

{#snippet template(
  { label, value, ...args }: Args<typeof Story>,
  context: StoryContext<typeof Story>,
)}
  <RadioGroup name={args.name} group={writable('checked')}>
    <RadioInput {label} {value} {...args} id={context.id} />
  </RadioGroup>
{/snippet}

<Story
  name="Checked"
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('radio'))}
/>

<Story
  name="Unchecked"
  args={{ value: 'unchecked' }}
  play={shouldNotBeTransparent((canvas) => canvas.getByRole('radio'))}
/>

<Story name="Checked and Disabled" args={{ disabled: true }} />

<Story
  name="Unchecked and Disabled"
  args={{ value: 'unchecked', disabled: true }}
/>

<Story name="Description" args={{ description: 'This is a description.' }} />

<Story
  name="Long Description"
  args={{
    description: loremIpsum,
  }}
/>

<Story name="Group Description">
  {#snippet children({ label, value, ...args }, context)}
    <RadioGroup
      name={args.name}
      description="This is a group description."
      group={writable('checked')}
    >
      <RadioInput {label} {value} {...args} id={context.id} />
    </RadioGroup>
  {/snippet}
</Story>

<Story name="Long Group Description">
  {#snippet children({ label, value, ...args }, context)}
    <RadioGroup
      name={args.name}
      description={loremIpsum}
      group={writable('checked')}
    >
      <RadioInput {label} {value} {...args} id={context.id} />
      <RadioInput {label} value="unchecked" {...args} id={context.id} />
    </RadioGroup>
  {/snippet}
</Story>
