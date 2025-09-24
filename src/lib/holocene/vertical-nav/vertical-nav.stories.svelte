<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';

  import VerticalNavItem from './vertical-nav-item.svelte';
  import VerticalNav from './vertical-nav.svelte';

  export const meta = {
    title: 'Holocene/VerticalNav',
    component: VerticalNav,
  } satisfies Meta<VerticalNav>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';

  let activeItemId = $state('overview');
</script>

<Template let:args>
  <div class="min-h-[400px] w-64 border-r border-subtle p-4">
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
</Template>

<Story name="Default" args={{ activeItemId: 'overview' }} />

<Story name="With Active Item" args={{ activeItemId: 'security' }} />

<Story name="With Disabled Items">
  <div class="min-h-[400px] w-64 border-r border-subtle p-4">
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

<Story name="Interactive">
  <div class="min-h-[400px] w-64 border-r border-subtle p-4">
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

<Story name="With Trailing Icons">
  <div class="min-h-[400px] w-64 border-r border-subtle p-4">
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
