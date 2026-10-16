<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

  import BadgeStatus from '$lib/io/badge-status/badge-status.svelte';
  import Button from '$lib/io/button/button.svelte';
  import Chip from '$lib/io/chip/chip.svelte';
  import ChipStatus, {
    type ChipStatusValue,
  } from '$lib/io/chip-status/chip-status.svelte';
  import {
    IconAdd,
    IconAwsColor,
    IconDot,
    IconHeartbeat,
    IconKey,
    IconLightningBolt,
    IconLock,
    IconRetry,
    IconTemporal,
  } from '$lib/io/icon';
  import Tag from '$lib/io/tag/tag.svelte';

  import PageHeader from './page-header.svelte';

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
    parameters: { layout: 'padded' },
    render: template,
  });
</script>

{#snippet heading()}
  Heading
{/snippet}

{#snippet listHeading()}
  1,248 Workflows
{/snippet}

{#snippet detailHeading()}
  frontend.a2dd6
{/snippet}

{#snippet leading()}
  <BadgeStatus status="Running" TrailIcon={IconHeartbeat} />
{/snippet}

{#snippet refresh()}
  <Button
    colorScheme="ghost"
    size="sm"
    LeadingIcon={IconRetry}
    aria-label="Refresh"
    onclick={action('Refresh')}
  />
{/snippet}

{#snippet detailHeadingActions()}
  <Button
    colorScheme="ghost"
    size="sm"
    LeadingIcon={IconTemporal}
    aria-label="Namespace information"
    onclick={action('Namespace information')}
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
    Add Tags
  </Button>
{/snippet}

{#snippet detailTags()}
  <Tag text="environment" colorScheme="success" />
  <Tag text="team" />
{/snippet}

{#snippet description()}
  Processes customer orders for the production payments service, including
  payment authorization, inventory updates, and fulfillment notifications.
{/snippet}

{#snippet detailDescription()}
  This is a super cool description of the namespace.
{/snippet}

{#snippet lastRefreshed()}
  <time datetime="2026-10-16T14:32:00Z">Oct 16, 2026, 14:32:00 UTC</time>
{/snippet}

{#snippet actions()}
  <Button
    colorScheme="secondary"
    size="sm"
    onclick={action('Secondary action')}
  >
    Secondary
  </Button>
  <Button size="sm" onclick={action('Primary action')}>Primary</Button>
{/snippet}

{#snippet listActions()}
  <Button colorScheme="secondary" size="sm" onclick={action('Connect')}>
    Connect
  </Button>
  <Button size="sm" onclick={action('Start Workflow')}>Start Workflow</Button>
{/snippet}

{#snippet detailActions()}
  <Button colorScheme="secondary" size="sm" onclick={action('Settings')}>
    Settings
  </Button>
  <Button size="sm" onclick={action('Connect')}>Connect</Button>
{/snippet}

{#snippet filters()}
  {#each statuses as status (status)}
    <ChipStatus {status} extension={135} onclick={action(`Filter ${status}`)} />
  {/each}
{/snippet}

{#snippet listFilters()}
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

{#snippet detailMetadata()}
  <Chip
    text="primary"
    Icon={IconDot}
    extension={{ text: 'us-west-2', Icon: IconAwsColor }}
    onclick={action('Primary region')}
  />
  <Chip
    text="secondary"
    Icon={IconAwsColor}
    extension={{ text: 'us-east-1' }}
    onclick={action('Secondary region')}
  />
  <Chip
    text="on-demand"
    Icon={IconLightningBolt}
    extension={{ text: '500 aps' }}
    onclick={action('Namespace capacity')}
  />
  <Chip
    text="encryption"
    Icon={IconLock}
    extension={{ text: 'on' }}
    onclick={action('Encryption settings')}
  />
  <Chip
    text="Fairness"
    Icon={IconKey}
    extension={{ text: 'on' }}
    onclick={action('Fairness settings')}
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
  name="Kitchen sink"
  args={{
    leading,
    headingActions: refresh,
    tags,
    description,
    actions,
    filters,
    metadata,
  }}
/>

<Story
  name="List page"
  args={{
    heading: listHeading,
    headingActions: refresh,
    description: lastRefreshed,
    actions: listActions,
    filters: listFilters,
  }}
/>

<Story
  name="Detail page"
  args={{
    heading: detailHeading,
    headingActions: detailHeadingActions,
    tags: detailTags,
    description: detailDescription,
    actions: detailActions,
    metadata: detailMetadata,
  }}
/>

<Story
  name="Stacked vs Unstacked Actions"
  args={{
    heading: listHeading,
    headingActions: refresh,
    description: lastRefreshed,
    actions: listActions,
  }}
>
  {#snippet template(args: ComponentProps<typeof PageHeader>)}
    <div class="flex flex-col gap-6">
      <section>
        <h2 class="mb-2 text-sm font-medium">
          Unstacked actions — wide container
        </h2>
        {@render example(args, 1200)}
      </section>
      <section>
        <h2 class="mb-2 text-sm font-medium">
          Stacked actions — narrow container
        </h2>
        {@render example(args, 480)}
      </section>
    </div>
  {/snippet}
</Story>
