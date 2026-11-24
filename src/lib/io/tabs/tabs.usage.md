## Usage

```ts
import { Tab, TabBar, TabLink, TabLinkBar, TabPanel, Tabs } from '$lib/io/tabs';
```

### Choosing a component

- **Tabs that switch content on the same page:** use `Tabs`, `TabBar`, `Tab`
  and `TabPanel`. The URL does not change.
- **Tabs that go to a different URL:** use `TabLinkBar` and `TabLink`. These
  are navigation links that look like tabs.
- **Tabs that need a different look**, such as segments inside a card: use the
  undesigned primitive from `$lib/io/tabs/primitive` and render your own
  elements.

Do not use `Tabs` for route changes. In a tablist, the arrow keys select tabs,
so every key press would load a new page. Screen readers would also announce
the links as in-page tabs.

### Tabs that switch content

```svelte
<Tabs tabs={['inbound', 'outbound']} bind:selectedTab>
  <TabBar aria-label="Nexus links">
    {#snippet tabSnippet({ tab, getAttributes })}
      <Tab {...getAttributes()} count={counts[tab]}>{labels[tab]}</Tab>
    {/snippet}
  </TabBar>
  <TabPanel tab="inbound">…</TabPanel>
  <TabPanel tab="outbound">…</TabPanel>
</Tabs>
```

- **Tab values:** `tabs` lists the tab values in display order. Each value must
  be unique. Values are used as keys and in element ids, so slug-like strings
  work best, but any string is safe.
- **Selection:** `Tabs` owns the selected tab. Use `bind:selectedTab`, or pass
  `selectedTab` and handle `onSelectedTabChange`. The first tab is selected by
  default. Selecting the tab that is already selected does not call
  `onSelectedTabChange`.
- **Tab attributes:** spread `getAttributes()` onto each `Tab`. It adds the
  ARIA role, ids, tab order and click handling. To add your own `onclick` or
  `onkeydown`, pass it to `getAttributes({ onclick })`, so both handlers run.
- **Labels:** `TabBar` needs an `aria-label`.
- **Panels:** add one `TabPanel` for each tab. Only the selected panel's content
  is mounted. Set `keepMounted` to keep a hidden panel's content and state.
  Panels are focusable by default. If a panel's content has its own focusable
  elements, set `tabindex={-1}` on the panel.
- **Disabled tabs:** pass `isTabDisabled`. Disabled tabs are skipped by the
  arrow keys and cannot be selected. Do not set `disabled` on a `Tab` yourself.
- **Activation:** arrow keys select a tab as they focus it. If a panel is slow
  to render, set `activation="manual"`, so the user presses Enter or Space to
  select.

### Tabs that change the URL

```svelte
<TabLinkBar aria-label="Workflow pages">
  <TabLink href={historyHref} current={isHistoryPage} count={eventCount}>
    Event History
  </TabLink>
  <TabLink href={workersHref} current={isWorkersPage}>Workers</TabLink>
</TabLinkBar>
```

`TabLinkBar` renders a `nav` landmark, so it needs an `aria-label`. Set
`current` on the link for the current page. It adds `aria-current="page"`. Work
out `current` from the route. The bar does not track selection.

### Keyboard

| Component    | Keys                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `TabBar`     | Tab moves into the bar and out to the panel. Left and Right arrows move between tabs, and Home and End go to the first or last tab. |
| `TabLinkBar` | Tab moves from link to link. Enter follows the link.                                                                                |
