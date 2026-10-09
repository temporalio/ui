<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import BadgeStatus from '$lib/io/badge-status/badge-status.svelte';
  import Chip from '$lib/io/chip/chip.svelte';
  import ChipStatus, {
    type ChipStatusValue,
  } from '$lib/io/chip-status/chip-status.svelte';
  import {
    IconAdd,
    IconAwsColor,
    IconHeartbeat,
    IconRetry,
  } from '$lib/io/icon';
  import Tag from '$lib/io/tag/tag.svelte';

  import PageHeaderLayout from './page-header-layout.svelte';

  const statuses: ChipStatusValue[] = [
    'Running',
    'Paused',
    'Completed',
    'ContinuedAsNew',
    'Failed',
    'TimedOut',
    'Terminated',
    'Canceled',
  ];

  const { Story } = defineMeta({
    title: 'IO/Design System/Structure/Page Header Layout',
    component: PageHeaderLayout,
    args: {
      heading,
      leading,
      headingActions,
      tags: addTags,
      description: addDescription,
      actions,
      filters,
      metadata,
    },
    argTypes: {
      heading: { control: false },
      leading: { control: false },
      headingActions: { control: false },
      tags: { control: false },
      description: { control: false },
      actions: { control: false },
      filters: { control: false },
      metadata: { control: false },
      class: { table: { disable: true } },
    },
    parameters: {
      layout: 'padded',
      docs: {
        description: {
          component:
            'Composition examples for the Page Header Layout. The Figma reference uses a 600px container. Use the theme toolbar to compare light and dark appearances; action controls log to the Actions panel.',
        },
      },
    },
    render: template,
  });
</script>

{#snippet heading()}
  Heading
{/snippet}

{#snippet longHeading()}
  customer-order-processing-production-us-west-2
{/snippet}

{#snippet leading()}
  <BadgeStatus status="Running" TrailIcon={IconHeartbeat} />
{/snippet}

{#snippet headingActions()}
  <Button
    variant="ghost"
    size="xs"
    class="h-6"
    LeadingIcon={IconRetry}
    aria-label="Refresh"
    onclick={action('Refresh')}
  />
{/snippet}

{#snippet addTags()}
  <Button
    variant="ghost"
    size="xs"
    LeadingIcon={IconAdd}
    class="h-6 text-primary underline underline-offset-2"
    onclick={action('Add tags')}
  >
    Add Tags
  </Button>
{/snippet}

{#snippet existingTags()}
  <Tag text="production" />
  <Tag text="payments" colorScheme="info" />
  {@render addTags()}
{/snippet}

{#snippet addDescription()}
  <Button
    variant="ghost"
    size="xs"
    LeadingIcon={IconAdd}
    class="h-6 text-primary underline underline-offset-2"
    onclick={action('Add description')}
  >
    Add Description
  </Button>
{/snippet}

{#snippet existingDescription()}
  <p class="text-sm text-secondary">This is a super cool description</p>
{/snippet}

{#snippet actions()}
  <Button
    variant="secondary"
    size="xs"
    class="h-6"
    onclick={action('Secondary action')}
  >
    Secondary
  </Button>
  <Button
    variant="primary"
    size="xs"
    class="h-6"
    onclick={action('Primary action')}
  >
    Primary
  </Button>
{/snippet}

{#snippet manyActions()}
  <Button
    variant="tertiary"
    size="sm"
    class="h-6"
    onclick={action('View history')}
  >
    View history
  </Button>
  <Button variant="tertiary" size="sm" class="h-6" onclick={action('Export')}>
    Export
  </Button>
  <Button
    variant="secondary"
    size="sm"
    class="h-6"
    onclick={action('Edit configuration')}
  >
    Edit configuration
  </Button>
  {@render actions()}
{/snippet}

{#snippet filters()}
  {#each statuses as status (status)}
    <ChipStatus {status} extension={135} onclick={action(`Filter ${status}`)} />
  {/each}
{/snippet}

{#snippet metadata()}
  <Chip
    text="primary"
    Icon={IconAwsColor}
    extension={{ text: 'US-WEST-2' }}
    onclick={action('Region metadata')}
  />
{/snippet}

{#snippet example(args: ComponentProps<typeof PageHeaderLayout>, width: number)}
  <main
    class="max-w-full border border-primary bg-background-primary text-primary"
    style:width="{width}px"
  >
    <PageHeaderLayout {...args} />
  </main>
{/snippet}

{#snippet template(args: ComponentProps<typeof PageHeaderLayout>)}
  {@render example(args, 1200)}
{/snippet}

<Story name="All regions" />

<Story name="Figma reference — 600px">
  {#snippet template(args: ComponentProps<typeof PageHeaderLayout>)}
    {@render example(args, 600)}
  {/snippet}
</Story>

<Story name="Narrow — 360px">
  {#snippet template(args: ComponentProps<typeof PageHeaderLayout>)}
    {@render example(args, 360)}
  {/snippet}
</Story>

<Story
  name="With tags and description"
  args={{ tags: existingTags, description: existingDescription }}
/>

<Story name="Many actions" args={{ actions: manyActions }} />

<Story name="Long heading" args={{ heading: longHeading }}>
  {#snippet template(args: ComponentProps<typeof PageHeaderLayout>)}
    {@render example(args, 600)}
  {/snippet}
</Story>

<Story
  name="Heading only"
  args={{
    leading: undefined,
    headingActions: undefined,
    tags: undefined,
    description: undefined,
    actions: undefined,
    filters: undefined,
    metadata: undefined,
  }}
/>
