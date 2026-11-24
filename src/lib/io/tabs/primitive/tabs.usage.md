## Usage

```ts
import { TabBar, TabPanel, Tabs } from '$lib/io/tabs/primitive';
```

Use the primitive when tabs need a look that the designed tabs in
`$lib/io/tabs` don't provide. It handles the ARIA roles, ids, selection, tab
order and keyboard navigation. You render the elements.

```svelte
<Tabs {tabs} bind:selectedTab>
  <TabBar aria-label="Workflow runs" class={segmentedControlRecipe()}>
    {#snippet tabSnippet({ tab, isSelected, getAttributes })}
      <Segment {...getAttributes()} selected={isSelected}>
        {labels[tab]}
      </Segment>
    {/snippet}
  </TabBar>
  <TabPanel tab="recent">…</TabPanel>
  <TabPanel tab="upcoming">…</TabPanel>
</Tabs>
```

- **Tab elements:** spread `getAttributes()` onto each tab. A `<button>` works
  best. Other elements also work, because `getAttributes` adds Enter and Space
  handling. Pass your own `onclick` or `onkeydown` to `getAttributes`, so both
  handlers run.
- **Styling:** style tabs with `isSelected` and `isDisabled`, or with
  `aria-selected` and `aria-disabled`. Disabled tabs get `aria-disabled`, not
  the native `disabled` attribute.
- **Orientation:** `Tabs` takes `orientation`, `activation` and
  `isTabDisabled`. With `orientation="vertical"`, the Up and Down arrows move
  between tabs instead of Left and Right.
- **Wrappers:** put layout classes on `TabBar` itself. Don't wrap it in another
  element with `display: contents`, because some browsers then drop the
  tablist role.

`Tabs` and `TabPanel` behave the same as in the designed tabs. See the Tabs docs
for selection, panels and when to use links instead.
