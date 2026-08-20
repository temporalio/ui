<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import VerticalNavItem from './vertical-nav-item.svelte';
  import VerticalNav from './vertical-nav.svelte';

  const { Story } = defineMeta({
    title: 'Vertical Nav',
    component: VerticalNav,
  });
</script>

<script lang="ts">
  let activeItemId = $state('overview');
</script>

{#snippet template(args: ComponentProps<typeof VerticalNav>)}
  <div class="min-h-[400px] w-64 border-r border-io-border-primary p-4">
    <VerticalNav
      aria-label="Settings navigation"
      activeItemId={args.activeItemId}
    >
      <VerticalNavItem
        id="overview"
        href="#overview"
        label="Overview"
        leadingIcon="office-buildings"
      />
      <VerticalNavItem
        id="security"
        href="#security"
        label="Security"
        leadingIcon="lock"
        description="Manage deletion protection"
      />
      <VerticalNavItem
        id="tags"
        href="#tags"
        label="Tags"
        leadingIcon="tag"
        description="Namespace metadata"
      />
      <VerticalNavItem
        id="connectivity"
        href="#connectivity"
        label="Connectivity"
        leadingIcon="link"
        description="Private link configuration"
      />
      <VerticalNavItem
        id="search-attributes"
        href="#search-attributes"
        label="Search Attributes"
        leadingIcon="search"
        description="Custom search fields"
      />
    </VerticalNav>
  </div>
{/snippet}

<Story name="Default" args={{ activeItemId: 'overview' }} {template} />

<Story name="With Active Item" args={{ activeItemId: 'security' }} {template} />

<Story name="With Disabled Items" asChild>
  <div class="min-h-[400px] w-64 border-r border-io-border-primary p-4">
    <VerticalNav aria-label="Settings navigation" activeItemId="overview">
      <VerticalNavItem
        id="overview"
        href="#overview"
        label="Overview"
        leadingIcon="office-buildings"
      />
      <VerticalNavItem
        id="security"
        href="#security"
        label="Security"
        leadingIcon="lock"
        description="Manage deletion protection"
      />
      <VerticalNavItem
        id="tags"
        href="#tags"
        label="Tags (Coming Soon)"
        leadingIcon="tag"
        description="Namespace metadata"
        disabled={true}
      />
      <VerticalNavItem
        id="connectivity"
        href="#connectivity"
        label="Connectivity (Coming Soon)"
        leadingIcon="link"
        description="Private link configuration"
        disabled={true}
      />
    </VerticalNav>
  </div>
</Story>

<Story name="Interactive" asChild>
  <div class="min-h-[400px] w-64 border-r border-io-border-primary p-4">
    <VerticalNav aria-label="Settings navigation" {activeItemId}>
      <VerticalNavItem
        id="overview"
        href="#overview"
        label="Overview"
        leadingIcon="office-buildings"
        onclick={() => (activeItemId = 'overview')}
      />
      <VerticalNavItem
        id="security"
        href="#security"
        label="Security"
        leadingIcon="lock"
        description="Manage deletion protection"
        onclick={() => (activeItemId = 'security')}
      />
      <VerticalNavItem
        id="tags"
        href="#tags"
        label="Tags"
        leadingIcon="tag"
        description="Namespace metadata"
        onclick={() => (activeItemId = 'tags')}
      />
      <VerticalNavItem
        id="connectivity"
        href="#connectivity"
        label="Connectivity"
        leadingIcon="link"
        description="Private link configuration"
        onclick={() => (activeItemId = 'connectivity')}
      />
      <VerticalNavItem
        id="search-attributes"
        href="#search-attributes"
        label="Search Attributes"
        leadingIcon="search"
        description="Custom search fields"
        onclick={() => (activeItemId = 'search-attributes')}
      />
      <VerticalNavItem
        id="codec-server"
        href="#codec-server"
        label="Codec Server"
        leadingIcon="terminal"
        description="Data encryption settings"
        onclick={() => (activeItemId = 'codec-server')}
      />
      <VerticalNavItem
        id="export"
        href="#export"
        label="Export"
        leadingIcon="download"
        description="Data export configuration"
        onclick={() => (activeItemId = 'export')}
      />
    </VerticalNav>
  </div>
  <div class="p-4">
    <p>Active item: <strong>{activeItemId}</strong></p>
  </div>
</Story>

<Story name="With Trailing Icons" asChild>
  <div class="min-h-[400px] w-64 border-r border-io-border-primary p-4">
    <VerticalNav aria-label="Settings navigation" activeItemId="overview">
      <VerticalNavItem
        id="overview"
        href="#overview"
        label="Overview"
        leadingIcon="office-buildings"
        trailingIcon="chevron-right"
      />
      <VerticalNavItem
        id="security"
        href="#security"
        label="Security"
        leadingIcon="lock"
        trailingIcon="external-link"
        description="Opens in new tab"
      />
      <VerticalNavItem
        id="tags"
        href="#tags"
        label="Tags"
        leadingIcon="tag"
        trailingIcon="info"
        description="Learn more about tags"
      />
    </VerticalNav>
  </div>
</Story>

<Story name="With Content Panels" asChild>
  <div class="flex min-h-[500px]">
    <!-- Navigation -->
    <div class="w-64 border-r border-io-border-primary p-4">
      <VerticalNav aria-label="Settings navigation" {activeItemId}>
        <VerticalNavItem
          id="overview"
          href="#overview"
          label="Overview"
          leadingIcon="office-buildings"
          onclick={(e) => {
            e.preventDefault();
            activeItemId = 'overview';
          }}
        />
        <VerticalNavItem
          id="security"
          href="#security"
          label="Security"
          leadingIcon="lock"
          description="Manage deletion protection"
          onclick={(e) => {
            e.preventDefault();
            activeItemId = 'security';
          }}
        />
        <VerticalNavItem
          id="tags"
          href="#tags"
          label="Tags"
          leadingIcon="tag"
          description="Namespace metadata"
          onclick={(e) => {
            e.preventDefault();
            activeItemId = 'tags';
          }}
        />
        <VerticalNavItem
          id="connectivity"
          href="#connectivity"
          label="Connectivity"
          leadingIcon="link"
          description="Private link configuration"
          onclick={(e) => {
            e.preventDefault();
            activeItemId = 'connectivity';
          }}
        />
        <VerticalNavItem
          id="search-attributes"
          href="#search-attributes"
          label="Search Attributes"
          leadingIcon="search"
          description="Custom search fields"
          onclick={(e) => {
            e.preventDefault();
            activeItemId = 'search-attributes';
          }}
        />
      </VerticalNav>
    </div>

    <!-- Content Area -->
    <div class="flex-1 p-6">
      {#if activeItemId === 'overview'}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Overview</h2>
          <p class="text-io-content-secondary">
            Get a high-level view of your namespace configuration and usage.
          </p>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-io-border-primary p-4">
              <h3 class="mb-2 font-medium">Region</h3>
              <p class="text-sm text-io-content-secondary">us-west-2</p>
            </div>
            <div class="rounded-lg border border-io-border-primary p-4">
              <h3 class="mb-2 font-medium">Created</h3>
              <p class="text-sm text-io-content-secondary">2 months ago</p>
            </div>
          </div>
        </div>
      {:else if activeItemId === 'security'}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Security Settings</h2>
          <p class="text-io-content-secondary">
            Configure deletion protection and other security features.
          </p>
          <div class="rounded-lg border border-io-border-primary p-4">
            <label class="flex items-center gap-3">
              <input type="checkbox" class="rounded" checked />
              <div>
                <div class="font-medium">Enable deletion protection</div>
                <div class="text-sm text-io-content-secondary">
                  Prevent accidental namespace deletion
                </div>
              </div>
            </label>
          </div>
        </div>
      {:else if activeItemId === 'tags'}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Tags</h2>
          <p class="text-io-content-secondary">
            Add metadata tags to organize and categorize your namespace.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="rounded bg-io-surface-secondary px-2 py-1 text-sm">
                environment: production
              </span>
              <span class="rounded bg-io-surface-secondary px-2 py-1 text-sm">
                team: platform
              </span>
            </div>
            <button class="text-sm text-io-content-primary hover:underline">
              + Add tag
            </button>
          </div>
        </div>
      {:else if activeItemId === 'connectivity'}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Connectivity</h2>
          <p class="text-io-content-secondary">
            Configure private links and network connectivity options.
          </p>
          <div class="rounded-lg border border-io-border-primary p-4">
            <h3 class="mb-2 font-medium">Private Links</h3>
            <p class="text-sm text-io-content-secondary">
              No private links configured
            </p>
            <button
              class="mt-2 text-sm text-io-content-primary hover:underline"
            >
              Configure private link
            </button>
          </div>
        </div>
      {:else if activeItemId === 'search-attributes'}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Search Attributes</h2>
          <p class="text-io-content-secondary">
            Define custom search attributes for advanced workflow filtering.
          </p>
          <div class="space-y-2">
            <div class="rounded-lg border border-io-border-primary p-3">
              <div class="flex items-center justify-between">
                <span class="font-mono text-sm">CustomerId</span>
                <span class="text-sm text-io-content-secondary">Keyword</span>
              </div>
            </div>
            <div class="rounded-lg border border-io-border-primary p-3">
              <div class="flex items-center justify-between">
                <span class="font-mono text-sm">OrderAmount</span>
                <span class="text-sm text-io-content-secondary">Double</span>
              </div>
            </div>
            <button class="text-sm text-io-content-primary hover:underline">
              + Add attribute
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</Story>
