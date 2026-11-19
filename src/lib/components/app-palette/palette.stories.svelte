<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';

  import {
    IconBook,
    IconCode,
    IconCopy,
    IconMoon,
    IconNamespace,
    IconSearch,
    IconSun,
    IconTerminal,
    IconTrash,
  } from '$lib/io/icon';

  import type {
    PaletteAction,
    PaletteItem,
    PaletteToolSet,
    PaletteView,
  } from './types';

  import Palette from './palette.svelte';

  const run = (name: string): PaletteAction['run'] => action(name);

  const NAMESPACES = [
    'payments-prod',
    'payments-staging',
    'orders-prod',
    'orders-staging',
    'inventory-prod',
    'inventory-staging',
    'notifications',
    'analytics',
    'billing',
    'sandbox',
  ];

  const namespaceView: PaletteView = {
    id: 'namespaces',
    title: 'Namespaces',
    placeholder: 'Filter namespaces…',
    emptyText: 'No namespaces',
    items: () =>
      NAMESPACES.map((namespace) => ({
        id: namespace,
        title: namespace,
        accessory:
          namespace === 'payments-prod'
            ? { label: 'Current', tone: 'brand' }
            : undefined,
        actions: [{ title: 'Open', run: run(`open ${namespace}`) }],
      })),
  };

  // A view whose results never arrive, to show the loading state.
  const loadingView: PaletteView = {
    id: 'loading',
    title: 'Loading',
    items: () => [],
    loading: () => true,
  };

  const errorView: PaletteView = {
    id: 'error',
    title: 'Error',
    items: () => [],
    error: () => 'Could not load the list.',
  };

  function resultsView(query: string): PaletteView {
    return {
      id: 'results',
      title: 'Docs',
      placeholder: 'Search docs…',
      initialQuery: query,
      items: () => [],
      search: (typed) =>
        ['Overview', 'Guide', 'Reference', 'Examples'].map((page) => ({
          id: `${typed}-${page}`,
          title: `${typed}: ${page}`,
          subtitle: 'Docs > Encyclopedia',
          icon: IconBook,
          actions: [{ title: 'Open in new tab', run: run(`open ${page}`) }],
        })),
    };
  }

  const pushTo = (view: PaletteView): PaletteAction['run'] => {
    return (ctx) => ctx.push(view);
  };

  const userSet: PaletteToolSet = {
    id: 'user',
    label: 'Cloud',
    key: 'c',
    tools: [
      {
        id: 'navigation',
        section: 'Go to',
        icon: IconNamespace,
        items: () => [
          {
            id: 'switch',
            title: 'Switch namespace',
            subtitle: 'Pick a namespace to open',
            actions: [{ title: 'Switch', run: pushTo(namespaceView) }],
          },
          {
            id: 'loading',
            title: 'Open a loading view',
            actions: [{ title: 'Open', run: pushTo(loadingView) }],
          },
          {
            id: 'error',
            title: 'Open a view that fails',
            actions: [{ title: 'Open', run: pushTo(errorView) }],
          },
        ],
      },
      {
        id: 'workflow',
        section: 'Workflow',
        icon: IconCopy,
        items: () => [
          {
            id: 'copy',
            title: 'Copy workflow ID',
            accessory: { label: 'Page', tone: 'information' },
            actions: [
              { title: 'Copy ID', run: run('copy id') },
              { title: 'Copy run ID', run: run('copy run id') },
            ],
          },
          {
            id: 'terminate',
            title: 'Terminate workflow',
            icon: IconTrash,
            actions: [
              {
                title: 'Terminate',
                destructive: true,
                confirm: 'Terminate this workflow?',
                run: run('terminate'),
              },
            ],
          },
          {
            id: 'reset',
            title: 'Reset workflow',
            disabled: 'Only running workflows can be reset',
            actions: [{ title: 'Reset', run: run('reset') }],
          },
        ],
      },
      {
        id: 'preferences',
        section: 'Preferences',
        items: () => [
          {
            id: 'light',
            title: 'Light theme',
            icon: IconSun,
            actions: [{ title: 'Use', run: run('light') }],
          },
          {
            id: 'dark',
            title: 'Dark theme',
            icon: IconMoon,
            actions: [{ title: 'Use', run: run('dark') }],
          },
        ],
      },
      {
        id: 'search-docs-for',
        section: 'Help',
        icon: IconSearch,
        fallback: true,
        items: () => [],
        search: (query): PaletteItem[] =>
          query.length < 3
            ? []
            : [
                {
                  id: 'search-for',
                  title: `Search the docs for “${query}”`,
                  actions: [
                    { title: 'Search', run: pushTo(resultsView(query)) },
                  ],
                },
              ],
      },
    ],
  };

  const devSet: PaletteToolSet = {
    id: 'dev',
    label: 'Dev',
    key: 'd',
    variant: 'dev',
    tools: [
      {
        id: 'dev-tools',
        section: 'Debug',
        icon: IconTerminal,
        items: () => [
          {
            id: 'flags',
            title: 'Feature flags',
            icon: IconCode,
            actions: [{ title: 'Open', run: run('flags') }],
          },
        ],
      },
    ],
  };

  const fewSet: PaletteToolSet = {
    id: 'few',
    label: 'Few',
    key: 'f',
    tools: [
      {
        id: 'few',
        section: 'Actions',
        items: () => [
          {
            id: 'one',
            title: 'Only item',
            actions: [{ title: 'Run', run: run('only item') }],
          },
        ],
      },
    ],
  };

  const { Story } = defineMeta({
    title: 'Application/Command Palette',
    component: Palette,
    args: {
      open: true,
      toolSets: [userSet, devSet],
    },
    argTypes: {
      open: { control: 'boolean' },
      toolSets: { control: false, table: { disable: true } },
    },
    parameters: {
      docs: {
        description: {
          component:
            'A ⌘K command palette. It renders the tool sets it is given. Actions log to the Actions panel. Shrink the canvas height to check that the footer stays inside the panel.',
        },
      },
    },
  });
</script>

<Story
  name="Default"
  parameters={{
    docs: {
      description: {
        story:
          'Several sections, a dev set, a multi-action item, a confirm, a disabled item, and pushed views. Type 3+ characters for the "Search the docs for" row, which opens a view with the query filled in.',
      },
    },
  }}
/>

<Story
  name="Few items"
  args={{ toolSets: [fewSet] }}
  parameters={{
    docs: {
      description: {
        story: 'The panel keeps its shape when there is little to show.',
      },
    },
  }}
/>
