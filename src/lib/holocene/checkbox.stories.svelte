<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Checkbox from '$lib/holocene/checkbox.svelte';

  const loremIpsum =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porttitor nec nulla et elementum. Nulla eget fermentum magna. Ut vel turpis at nulla interdum auctor. Etiam semper arcu non lectus porta, sit amet hendrerit ipsum ultricies. Suspendisse potenti. Nulla facilisi. Donec sit amet risus placerat, volutpat enim ac, elementum turpis. Etiam faucibus nisl ac sollicitudin placerat. Etiam in tincidunt erat. Pellentesque in tempor tortor.';
</script>

<Meta
  title="Checkbox"
  component={Checkbox}
  argTypes={{
    label: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
  }}
/>

<Template let:args>
  <Checkbox
    {...args}
    on:change={action('change')}
    on:click={action('click')}
    on:keypress={action('keypress')}
  />
</Template>

<Story
  name="checkbox"
  args={{ label: 'Check Me', hoverable: true, disabled: false }}
/>

<Story name="So Many" template="Many" args={{ label: loremIpsum }} />

<Template id="Many" let:args>
  <div class="border-bl flex max-w-xl flex-col gap-5 border-2 p-5">
    <Checkbox
      label={loremIpsum}
      hoverable
      {...args}
      on:change={action('change')}
      on:click={action('click')}
      on:keypress={action('keypress')}
    />
    <Checkbox
      label={loremIpsum}
      {...args}
      on:change={action('change')}
      on:click={action('click')}
      on:keypress={action('keypress')}
    />
    <Checkbox
      {...args}
      class="whitespace-nowrap"
      label="This one can intentionally break out of the mold to demonstrate we still have nowrap as an option"
      hoverable
      on:change={action('change')}
      on:click={action('click')}
      on:keypress={action('keypress')}
    />
    <Checkbox
      label={loremIpsum}
      {...args}
      on:change={action('change')}
      on:click={action('click')}
      on:keypress={action('keypress')}
    />
    <Checkbox
      label={loremIpsum}
      hoverable
      {...args}
      on:change={action('change')}
      on:click={action('click')}
      on:keypress={action('keypress')}
    />
  </div>
</Template>
