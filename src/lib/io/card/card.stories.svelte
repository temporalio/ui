<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import { Badge } from '$lib/io/badge';
  import { Button } from '$lib/io/button';
  import { Card } from '$lib/io/card';
  import { IconCheckCircle } from '$lib/io/icon';
  import emptyStateImage from '$lib/vendor/empty-state.svg';

  const description =
    "A supporting paragraph or description. And here's some amazing content. It's very engaging. Right?";

  const { Story } = defineMeta({
    title: 'IO/Components/Card',
    tags: ['autodocs'],
    component: Card,
    args: {
      title: 'Card',
      description,
      headingLevel: 3,
    },
    argTypes: {
      title: { control: 'text' },
      description: { control: 'text' },
      headingLevel: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
      LeadingIcon: { control: false },
      media: { control: false },
      actions: { control: false },
      footer: { control: false },
      class: { table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'A container that groups a title and description with optional media, actions, and footer.',
        },
      },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof Card>)}
  <Card {...args} class="max-w-96" />
{/snippet}

<Story tags={['!dev']} name="Playground" />

<Story name="With leading icon" args={{ LeadingIcon: IconCheckCircle }} />

<Story name="With title badge" asChild>
  <Card class="max-w-96" {description}>
    {#snippet title()}
      Card
      <Badge text="badge" colorScheme="info" size="sm" />
    {/snippet}
  </Card>
</Story>

<Story name="With rich description" asChild>
  <Card class="max-w-96" title="Card">
    {#snippet description()}
      <p>A supporting paragraph or description.</p>
      <p>And here's a second paragraph with even more amazing content.</p>
    {/snippet}
  </Card>
</Story>

<Story name="With actions" asChild>
  <Card class="max-w-96" title="Card" {description}>
    {#snippet actions()}
      <Button colorScheme="ghost">Button</Button>
      <Button colorScheme="primary">Button</Button>
    {/snippet}
  </Card>
</Story>

<Story name="With footer" asChild>
  <Card class="max-w-96" title="Card" {description}>
    {#snippet footer()}
      Updated 3 days ago
    {/snippet}
  </Card>
</Story>

<Story name="With media" asChild>
  <Card class="max-w-96" title="Card" {description}>
    {#snippet media()}
      <img src={emptyStateImage} alt="" />
    {/snippet}
  </Card>
</Story>

<Story name="Kitchen sink" asChild>
  <Card class="max-w-96" LeadingIcon={IconCheckCircle} {description}>
    {#snippet media()}
      <img src={emptyStateImage} alt="" />
    {/snippet}
    {#snippet title()}
      Card
      <Badge text="badge" colorScheme="info" size="sm" />
    {/snippet}
    {#snippet actions()}
      <Button colorScheme="ghost">Button</Button>
      <Button colorScheme="primary">Button</Button>
    {/snippet}
    {#snippet footer()}
      Updated 3 days ago
    {/snippet}
  </Card>
</Story>
