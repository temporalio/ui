<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';

  const { Story } = defineMeta({
    title: 'Compatibility Badge',
    component: CompatibilityBadge,
    args: {
      defaultVersion: true,
      active: false,
      buildId: '1234567890',
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template({ buildId, ...args }: Args<typeof Story>)}
  <CompatibilityBadge {buildId} {...args} />
{/snippet}

<Story name="Build ID" args={{ defaultVersion: false }} />

<Story name="Active" args={{ defaultVersion: true, active: true }} />

<Story name="Default Worker">
  {#snippet children({ buildId, ...args })}
    <CompatibilityBadge {buildId} {...args}>
      {#snippet defaultWorker()}
        <span>Default</span>
      {/snippet}
    </CompatibilityBadge>
  {/snippet}
</Story>

<Story name="Overall Default Worker">
  {#snippet children({ buildId, ...args })}
    <CompatibilityBadge {buildId} {...args}>
      {#snippet overallDefaultWorker()}
        <span>Overall</span>
      {/snippet}
    </CompatibilityBadge>
  {/snippet}
</Story>

<Story name="Default Worker (Active)" args={{ active: true }}>
  {#snippet children({ buildId, ...args })}
    <CompatibilityBadge {buildId} {...args}>
      {#snippet defaultWorker()}
        <span>Default</span>
      {/snippet}
    </CompatibilityBadge>
  {/snippet}
</Story>

<Story name="Overall Default Worker (Active)" args={{ active: true }}>
  {#snippet children({ buildId, ...args })}
    <CompatibilityBadge {buildId} {...args}>
      {#snippet overallDefaultWorker()}
        <span>Overall</span>
      {/snippet}
    </CompatibilityBadge>
  {/snippet}
</Story>
