<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import BadgeStatus from '$lib/io/badge-status/badge-status.svelte';
  import Button from '$lib/io/button/button.svelte';
  import Chip from '$lib/io/chip/chip.svelte';
  import ChipStatus, {
    type ChipStatusValue,
  } from '$lib/io/chip-status/chip-status.svelte';
  import {
    IconAdd,
    IconAwsColor,
    IconChevronDown,
    IconHeartbeat,
    IconRetry,
  } from '$lib/io/icon';
  import Tag from '$lib/io/tag/tag.svelte';

  import PageHeader from './page-header.svelte';

  const workflowId = 'customer-order-processing-production-us-west-2';
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
    title: 'IO/Structure/PageHeader',
    component: PageHeader,
    args: { heading },
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
            'A semantic page header with a required heading snippet and optional leading content, heading controls, tags, description, page actions, filters, and metadata. At an inner container width of 518px or more, actions float right (up to 35% width) inside a flow-root: inline heading content and description text flow beside the actions, then use the full width below them. The flow-root contains the float so filters and metadata remain separate full-width rows. Narrower containers stack the actions below the heading and description. The threshold is based on available header width, not viewport width. Buttons log to the Actions panel.',
        },
      },
    },
    render: template,
  });
</script>

{#snippet heading()}
  Workflows
{/snippet}

{#snippet listHeading()}
  1,248 Workflows
{/snippet}

{#snippet lastRefreshed()}
  <time datetime="2026-10-16T14:32:00Z">Oct 16, 2026, 14:32:00 UTC</time>
{/snippet}

{#snippet listActions()}
  <Button colorScheme="secondary" size="sm" onclick={action('Connect')}>
    Connect
  </Button>
  <Button size="sm" onclick={action('Start Workflow')}>Start Workflow</Button>
{/snippet}

{#snippet longHeading()}
  {workflowId}
{/snippet}

{#snippet copyableHeading()}
  <Copyable
    content={workflowId}
    clickAllToCopy
    container-class="!inline-flex max-w-full align-middle"
    copyIconTitle={translate('common.copy-icon-title')}
    copySuccessIconTitle={translate('common.copy-success-icon-title')}
  />
{/snippet}

{#snippet leading()}
  <BadgeStatus status="Running" TrailIcon={IconHeartbeat} />
{/snippet}

{#snippet completedStatus()}
  <BadgeStatus status="Completed" />
{/snippet}

{#snippet headingActions()}
  <Button
    colorScheme="ghost"
    size="sm"
    LeadingIcon={IconRetry}
    aria-label="Refresh"
    onclick={action('Refresh')}
  />
{/snippet}

{#snippet tags()}
  <Tag text="production" />
  <Tag text="payments" colorScheme="info" />
  <Button
    colorScheme="ghost"
    size="sm"
    LeadingIcon={IconAdd}
    onclick={action('Add tags')}
  >
    Add tags
  </Button>
{/snippet}

{#snippet description()}
  Processes customer orders for the production payments service.
{/snippet}

{#snippet wrappingDescription()}
  Processes customer orders for the production payments service, including
  payment authorization, inventory updates, and fulfillment notifications across
  all supported regions. Each order is validated before payment is collected,
  and fulfillment starts only after inventory has been reserved. Retries
  preserve the order history so operators can inspect previous attempts and
  investigate failures without losing context.
{/snippet}

{#snippet actions()}
  <Button colorScheme="secondary" size="sm" onclick={action('Export')}>
    Export
  </Button>
  <Button size="sm" onclick={action('Start workflow')}>Start workflow</Button>
{/snippet}

{#snippet workflowActions()}
  <Button
    colorScheme="secondary"
    size="sm"
    TrailingIcon={IconChevronDown}
    onclick={action('More actions')}
  >
    More actions
  </Button>
  <Button size="sm" onclick={action('Reset workflow')}>Reset</Button>
{/snippet}

{#snippet filters()}
  {#each statuses as status (status)}
    <ChipStatus {status} count={14} onclick={action(`Filter ${status}`)} />
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

{#snippet example(args: ComponentProps<typeof PageHeader>, width: number)}
  <main
    class="max-w-full border border-primary bg-background-primary text-primary"
    style:width="{width}px"
  >
    <PageHeader {...args} />
  </main>
{/snippet}

{#snippet template(args: ComponentProps<typeof PageHeader>)}
  {@render example(args, 1200)}
{/snippet}

<Story
  name="Heading controls and tags"
  args={{ leading, headingActions, tags, description }}
/>

<Story
  name="List page"
  args={{
    heading: listHeading,
    headingActions,
    description: lastRefreshed,
    actions: listActions,
    filters,
  }}
/>

<Story
  name="Copyable details heading"
  args={{
    heading: copyableHeading,
    leading: completedStatus,
    actions: workflowActions,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Supply an inline Copyable component through the heading snippet. More actions logs a click; it is not a wired dropdown.',
      },
    },
  }}
/>

<Story
  name="Kitchen sink"
  args={{
    leading,
    headingActions,
    tags,
    description,
    actions,
    filters,
    metadata,
  }}
/>

<Story
  name="Content wraps around actions"
  args={{
    heading: longHeading,
    description: wrappingDescription,
    actions,
    filters,
    metadata,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'At 800px, actions float on the right. Heading and description lines can use the space below the action group rather than staying in a permanently narrow column. Filters and metadata start after the float-containing section.',
      },
    },
  }}
>
  {#snippet template(args: ComponentProps<typeof PageHeader>)}
    {@render example(args, 800)}
  {/snippet}
</Story>

<Story
  name="Floated vs stacked"
  args={{ description: wrappingDescription, actions }}
>
  {#snippet template(args: ComponentProps<typeof PageHeader>)}
    <div class="flex flex-col gap-6">
      <section>
        <h2 class="mb-2 text-sm font-medium">
          620px container — floated actions
        </h2>
        {@render example(args, 620)}
      </section>
      <section>
        <h2 class="mb-2 text-sm font-medium">
          580px container — stacked actions
        </h2>
        {@render example(args, 580)}
      </section>
    </div>
  {/snippet}
</Story>

<Story
  name="Narrow container"
  args={{
    heading: longHeading,
    leading,
    headingActions,
    tags,
    description,
    actions,
    filters,
    metadata,
  }}
>
  {#snippet template(args: ComponentProps<typeof PageHeader>)}
    {@render example(args, 360)}
  {/snippet}
</Story>
