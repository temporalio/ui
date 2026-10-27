<script lang="ts">
  import {
    NavigationMenu,
    type NavigationMenuItem,
  } from '$lib/io-poc/navigation-menu';

  const topNavigation: NavigationMenuItem[] = [
    { label: 'Workflows', href: '#workflows', current: true },
    { label: 'Schedules', href: '#schedules' },
    { label: 'Batch', href: '#batch' },
    {
      label: 'Deployments',
      children: [
        {
          label: 'Worker deployments',
          href: '#worker-deployments',
          description: 'Versions and ramping status',
        },
        {
          label: 'Build IDs',
          href: '#build-ids',
          description: 'Compatibility and reachability',
        },
        {
          label: 'Serverless workers',
          href: '#serverless',
          description: 'Scale workers from zero',
        },
      ],
    },
    { label: 'Namespaces', href: '#namespaces' },
  ];

  const sideNavigation: NavigationMenuItem[] = [
    { label: 'Overview', href: '#overview' },
    {
      label: 'Settings',
      children: [
        { label: 'General', href: '#general' },
        { label: 'Retention', href: '#retention', current: true },
        { label: 'Search attributes', href: '#search-attributes' },
      ],
    },
    { label: 'Usage', href: '#usage-metrics' },
  ];
</script>

<div class="flex flex-col gap-10">
  <div class="min-h-56 border-b border-primary pb-2">
    <NavigationMenu items={topNavigation} label="Product" />
  </div>
  <div class="w-60">
    <NavigationMenu
      items={sideNavigation}
      label="Namespace"
      orientation="vertical"
    />
  </div>
</div>
