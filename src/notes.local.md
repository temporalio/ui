# New Workflow Timeline

## Background

The current timeline displays grouped events for one workflow execution. Child workflows appear only as separate read-only timelines inside inline event details, and the complete execution duration is scaled to the available width.

The new timeline should instead visualize an execution graph on one shared time axis. That graph can contain:

- Multiple runs in a continue-as-new chain
- Child workflows rendered inline with their parent
- Recursively nested child workflows
- Child workflows with their own continue-as-new chains
- Events and lifecycle groups belonging to each execution

The prototype in `~/Downloads/InfiniteTimelineWithChildren.mov` demonstrates the intended direction: visually nested workflows, distinct execution/run boundaries, inline child histories, smooth horizontal movement, and continued runs on the same time axis.

## Goals

- Display events from multiple workflow executions and related workflows in one timeline.
- Preserve workflow hierarchy while visually distinguishing individual executions.
- Support smooth horizontal panning and zooming across long-running workflows.
- Provide an overview minimap for navigation and orientation.
- Continue to support large histories without rendering the entire scene into the DOM.
- Keep event details outside the plotting area so selection does not alter row layout.
- Eventually support accessible keyboard navigation through the logical workflow hierarchy (defer tree-navigation implementation until the redesigned visual scene is settled).

## Glossary

**Workflow**
: A logical workflow at one hierarchy level, identified by namespace and workflow ID. It may contain multiple executions connected through continue-as-new.

**Execution / run**
: One run of a workflow, identified by a run ID. An execution owns one event history, and its event IDs are scoped to that run.

**Execution identity**
: The namespace, workflow ID, and run ID tuple that uniquely identifies an execution.

**Execution key**
: The stable serialized form of an execution identity used for repository, selection, and rendering lookups.

**Wire event**
: A raw history event in the JSON shape returned by the UI server. This is an API-boundary representation rather than the timeline's internal event model.

**Timeline event**
: The timeline's normalized representation of a wire event. It has an execution-qualified identity and the stable metadata needed for ordering, filtering, plotting, and selection.

**Execution history**
: Canonical event storage for one execution. It validates, deduplicates, orders, and ingests events but does not own workflow hierarchy or view state.

**Lifecycle event group**
: A semantic collection of related events within one execution, such as an activity's scheduled, started, and completed events. Failed and pending status filters primarily apply to these groups.

**Event group projection**
: Derived state that incrementally assembles lifecycle event groups from canonical execution events. It reports groups that were added or changed as new events and pending metadata arrive.

**Structural group**
: A workflow or execution container used to express hierarchy and visual nesting. Structural groups are distinct from lifecycle event groups.

**Execution repository**
: The single execution-keyed collection used by one timeline instance. It owns execution identities, histories, loading progress, errors, and request lifecycles.

**Execution graph**
: The relationship structure connecting workflows and executions through parent-child and continue-as-new edges. It references repository entries by execution key rather than containing additional repositories.

**Filter projection**
: Derived state containing loaded events or lifecycle groups that match the active filters. It updates from ingestion deltas and does not trigger history fetching.

**Timeline scene**
: The visible hierarchical projection produced from the execution graph after applying expansion, filtering, and sibling sorting.

**Timeline row**
: One fixed-height entry in the flattened timeline scene used for vertical virtualization. Rows may represent summaries, lifecycle groups, loading states, or errors.

**Decoration**
: A non-row visual derived from structural ranges and time intervals, such as workflow boundaries, execution boundaries, and relationship connectors.

**Time domain**
: The complete known time interval covered by the root execution graph.

**Time viewport**
: The currently visible interval within the time domain. Panning and zooming modify the viewport without modifying canonical timeline data.

## Isolation and Rollout

### Preserve the legacy timeline

The current timeline remains intact as the default implementation and rollback path. Do not incrementally refactor the legacy graph into the new architecture.

In particular, new timeline work should not require changes to the existing timeline-specific implementation under:

- `src/lib/components/lines-and-dots/timeline-graph/`
- `src/lib/layouts/workflow-timeline-layout.svelte`
- The current timeline's singleton grouped-event-buffer integration

The new implementation may reuse stable application-wide infrastructure such as API clients, generated types, design-system components, formatting utilities, and translation infrastructure. It should not depend on legacy timeline components, stores, layout models, or rendering internals.

If timeline-specific behavior needs a different model, implement it inside the new slice rather than changing the legacy behavior for both implementations. Shared extraction can be considered later, after the new implementation reaches parity and the compatibility requirements are understood.

### Feature-controlled integration

Select the implementation at a thin route or layout integration boundary:

```text
feature disabled → legacy WorkflowTimelineLayout
feature enabled  → new workflow-timeline layout
```

During initial development, the route uses `?new_timeline=true` as the temporary opt-in. An absent parameter or any value other than `true` selects the legacy implementation. This can later be replaced by a real feature flag at the same integration seam.

Requirements:

- The new timeline is disabled by default until it is ready for broader use.
- Existing timeline routes and deep links remain valid.
- The legacy and new implementations must not run simultaneously and duplicate history fetching or live polling.
- Disabling the feature immediately restores the legacy implementation without data migration.
- New timeline state must not mutate legacy timeline stores or singleton buffers.
- The feature decision should occur before either implementation initializes data loading.

The only expected changes outside `src/lib/workflow-timeline/` are narrow integration points such as:

- Feature flag definition and evaluation
- Route or layout selection
- Required translations
- Package export or Cloud UI consumption wiring
- Integration tests covering implementation selection

Cloud UI routes use the same temporary query-parameter selector when their linked or packed `@temporalio/ui` dependency contains the new entry point. Cloud still defaults to the legacy implementation.

## Time Domain and Viewport

### Linear time scale

The new timeline will use a linear time scale. The existing idle-time collapse feature will not be carried forward.

Panning, zooming, and the minimap replace the navigational purpose of idle-time compression. Removing idle compression also ensures that event coordinates remain stable when the viewport moves or workflow groups expand.

### Panning and zooming

The plotting viewport supports:

- Horizontal panning
- Zooming in and out by shortening or lengthening the visible timespan
- Time-to-screen projection and screen-to-time unprojection
- Smoothly moving, absolute-time axis ticks

Axis ticks should be anchored to absolute timestamps and translated with the viewport. Tick intervals may change at zoom thresholds, but should use hysteresis or an equivalent technique to avoid rapid visual switching.

### Follow latest and initial viewport (confirmed redesign requirements)

- While live polling is active, start with a rolling live window pinned to the right edge of the growing time domain, using a reasonable default duration rather than fitting the full workflow. If the workflow is already known to be closed on initial load, start fitted to its full duration instead.
- If the user manually scrolls away from the right edge, unpin the viewport. While polling continues and the domain grows to the right, keep the unpinned viewport's absolute time interval stable. Scrolling back near the right edge automatically re-enables live pinning, with a gentle snap toward the edge. Require a deliberate scroll away to break the pin again (hysteresis); tune exact thresholds during implementation.
- Let the user choose a time-window duration (for example, five minutes). Rescale the main viewport to cover approximately that duration, and allow horizontal scrolling from there.
- When live polling is off, the known time domain is normally static, but newly loaded related history may extend it. In that case, expand the domain and minimap without shifting or rescaling the main viewport's absolute time interval; the user pans to reach newly discovered events. Offer a Fit action that sets the visible duration to the full known workflow timeframe.
- Choose the default live-window duration for a running workflow with a heuristic informed by what is already known about it (including elapsed running time), rather than a fixed duration for every workflow. The precise heuristic remains to be decided.
- Changing the window duration while pinned live keeps the right edge pinned and expands or contracts the view toward the left. Changing the duration while unpinned scales the view around its current center time.
- If a running workflow completes while its live window is visible, preserve the current viewport and zoom. Do not automatically fit the now-complete workflow.

## Minimap

The minimap displays the full known bounds of the root execution graph.

- Execution metadata may extend the minimap bounds without requiring full history loading.
- The known domain may expand as additional related executions are discovered.
- A running graph uses `now` as its moving right boundary.
- Collapsing or expanding workflow groups does not change known global bounds.
- The minimap shows and controls the main plotting viewport. Show event-activity density across the full time domain; tentatively overlay spans for executions and child workflows to convey their ranges (validate this treatment visually).
- Click-drag on the minimap outside the current selection to select a visible time range (setting the main viewport's position and duration). Click-drag the existing selection to pan that same time range without changing its duration. Drag the selection edges or scroll vertically over the minimap to resize the window; wheel zoom anchors to its center unless live-pinned, when the right edge stays fixed. Horizontal scrolling over the minimap pans the selected window without changing its duration.

The minimap and plotting area use separate projections over the same global time domain:

- The minimap always displays the complete known domain.
- The plotting area displays only the currently selected time interval.

## Workflow and Execution Hierarchy

### Logical hierarchy

Workflows provide the logical nesting hierarchy. Executions in a continue-as-new chain belong to the same workflow level and do not introduce additional hierarchy depth.

A child workflow's execution boxes nest visually within the initiating parent execution. If the child continues as new, its runs appear as sibling execution boxes without a chain-level outer box.

Visual grouping must support arbitrary nesting of workflow, execution, and event collections.

### Default expansion and depth

Child workflows start collapsed by default. Eventually provide a persistent preference to expand children by default; the persistence mechanism and scope are still to be decided.

Initial depth defaults are:

- `childWorkflowDepth = 1`
- `continuedRunDepthBefore = 1`
- `continuedRunDepthAfter = unbounded`, through the latest known run

These are independent settings. The architecture must support greater child depth and different continue-as-new depths later.

Forward continue-as-new runs are loaded eagerly through the latest discoverable run by default. Each loaded history can reveal its successor; initial-history requests are concurrency-limited, but there is no default total-run cap. Child depth remains bounded independently.

### Collapsed workflows

A collapsed child workflow contributes:

- A compact summary row to vertical layout
- Its known execution interval to the global time domain and minimap

Its hidden descendant rows do not contribute vertical height. Collapsing a workflow must not change the global time bounds.

### Pending children

Do not render a pending child workflow until a started event or equivalent execution identity is available.

## Plotting and Visual Layout

### Confirmed scene layout (redesign interview)

- Place the minimap above the main timeline, outside its scrolling area. The minimap stays fixed while the main timeline scrolls, including on small screens. The main plot itself is a scroll area, including for horizontal panning. Wheel and trackpad gestures over the main plot remain ordinary scrolling unless Cmd or Ctrl is held; with either modifier, vertical scrolling zooms the selected time window and horizontal scrolling pans it, using the same behavior as unmodified scrolling over the minimap.
- Overlay a viewport window on the minimap showing the time range visible in the main plot. De-emphasize the portions of the minimap outside that window.
- Embed labels within their plotted rows rather than placing them in a dedicated sticky column. Prefer the earliest node-free gap inside the visible part of a lifecycle mark when the full label fits; left-align the label immediately after the preceding node instead of centering it in the gap. Otherwise place it outside on whichever side has more visible space, keeping it inside the viewport; only allow overlap with the mark when edge-sticking leaves no other room. As the plot pans horizontally, labels stay visible at whichever side of the row has the most available space, rather than following a left-first/right-fallback rule. Initial choice to validate visually: even when the entire lifecycle mark is off-screen, keep its label visible at an edge. Sticky labels must stay visually synchronized with native scrolling; avoid the delayed "catch-up" effect seen with JavaScript-driven label positioning. The result should feel like a graph, not a table.
- Keep the time axis visible at the top while scrolling vertically. Its ticks move horizontally with the plotted rows when panning horizontally.
- Attach the event-details panel to the bottom edge of the window as an overlay on both desktop and small screens. Opening it must not resize or reflow the main plotting area. A larger modal-like mobile presentation is a possible later revision after visual review.
- Defer controls for now; the scene layout should not be driven by a particular control design yet.
- Use the legacy timeline as the primary visual reference. The new scene must additionally group child workflows and workflow executions visually with border boxes encompassing the plots in each group, similar to the grouping in `InfiniteTimelineWithChildren.mov`. Start with mostly outline-only boxes, without prominent tinted fills, so the legacy-style marks remain visually dominant. Use the same border style at each nesting depth; spatial nesting should communicate hierarchy without depth-specific colors or weights.
- Each group box spans its group's start and end times horizontally, not the full plot width. For a still-running execution, extend the box and execution mark continuously toward moving `now`, not just the latest event. Initially use a legacy-style animated dashed continuation for an ongoing run and reassess visually. Start with boxes encompassing both labels and plotted marks. Prefer allowing a child box to extend beyond its parent's right edge if the child outlives the parent, provided this does not add disproportionate complexity.
- Nest child-workflow boxes visually within their parent execution's box, including recursively nested children. Place a child execution box immediately below the parent lifecycle row that started it.
- Child workflows start collapsed by default. Initial collapsed-child treatment: keep a compact single row beneath the initiating lifecycle instead of hiding the child entirely. Reassess this choice after seeing it rendered. When a child is expanded but its history has not loaded yet, show its box immediately with a compact loading row inside.
- A group's embedded label remains visible at whichever viewport edge has more available space when the box's start time pans off-screen; the time-bounded box itself need not remain fully visible. Keep the group label visible beneath the sticky time axis while vertically scrolling through its box, stacking nested group labels by depth so they do not cover one another.
- Do not render a separate workflow header. The workflow execution is the largest visual grouping; put its label on the same row as its start-to-end mark. Label each execution `Run {first eight characters of its run UUID}…` instead of a run index (whose value could change as earlier runs are discovered). Show the full run ID on hover and in the details overlay. Nested boxes and the shortened run label are enough context in the plot for now; do not add a separate workflow type or ID label initially.
- A continue-as-new chain does not get its own outer grouping. Give each run a sibling execution box, including single-run workflows (which need no redundant run row). Shared styling and placement are enough to associate consecutive runs; do not require a connector between them.
- Keep rows compact within each visual grouping, close to the legacy timeline's density. Leave approximately one row of space before each bordered group; inset the group's border from its start/end nodes, leave extra room between the final row's icons and the bottom border, and place its label in a matching-color tab on the top border. Let time tick lines continue through the full visible plot height, including empty space beneath short histories.
- The current opt-in scene feels like a table rather than a plotting area. Do not confine labels to a narrow fixed-width column where they are truncated. Small label indentations alone do not communicate the workflow hierarchy; the nested time-bounded boxes must do that visual work.
- Put expand/collapse in its own reserved action spot near the embedded execution label; clicking the label or mark should not implicitly toggle the child. Reserve this spot only on rows that can expand or collapse; non-expandable lifecycle rows do not need a blank action slot.
- Follow the legacy timeline's event-to-row grouping: the execution occupies one start-to-end row, while lifecycles such as activities and timers get their own rows and point events such as received signals appear on their own rows. Workflow-task events belong to the execution row rather than producing separate rows. Order sibling lifecycle rows chronologically by their initiating event, never by lifecycle type; a child box immediately follows its initiating row.
- Plot every meaningful event in a lifecycle on its shared row, including intermediate event marks; do not reduce a lifecycle to just start and end markers. Inherit the legacy timeline's event-specific icon/color/status treatment (including started, completed, failed, and pending states), rather than giving every mark in a lifecycle one category-only icon/color. Hover feedback should highlight only the mark, not the full row. Allow event icons to overlap at the current zoom level rather than bundling them; retain all underlying events in lifecycle details. Keep centered intermediate icons within the rendered mark bounds. For marks shorter than an icon, extend only the painted mark enough to contain its time-anchored endpoint icons. Keep lifecycle labels vertically centered on the same row as their marks, in a node-free span inside the mark when one fits or outside according to available space, with subtly translucent, lightly rounded backgrounds.

### Flattened row model

The logical execution graph should be flattened into a list of visible rows for layout and virtualization. Rows should use stable, execution-qualified identities.

Expected row types include:

- Execution/run grouping and label (no separate workflow header)
- Event lifecycle group
- Loading state
- Error state

Rows should remain fixed-height where possible. Workflow and execution containers can visually span multiple rows without being literal nested DOM containers.

### Decoration layers

Derive structural visuals from the scene separately from event-row marks. The initial redesign needs time-bounded, nested, mostly outline-only execution boxes (including child boxes). Continue-as-new runs are sibling boxes without a connecting line or chain-level outer box; prominent group background fills are not required.

Decoration geometry should be derived from subtree row ranges and execution time intervals. This allows structural containers to remain visible when some descendant rows are virtualized.

### Event details

Selecting a lifecycle's mark, line, or embedded label, including an individual event mark, opens the full lifecycle group's details in the edge-attached overlay. Include the individual details of each event in that group inside the same inspector. Details must not be inserted into plotting rows or shift timeline content.

Start with a fixed-height bottom-edge overlay on desktop and small screens (not initially resizable). A larger modal-like mobile treatment and the exact height can be refined later. The timeline renderer should only manage selection; inspector placement belongs to the surrounding layout.

## Filtering

Defer event filtering until the visual scene and core interactions are working. The requirements below describe the eventual behavior, not the first scene-redesign milestone.

Filters apply only to already loaded event rows. Filtering must not trigger additional execution-history fetches.

Structural behavior:

- Preserve workflow and execution structure around matching event rows.
- Retain unloaded structural groups because their match state is unknown.
- Retain a collapsed group when its loaded descendants contain matches.
- Remove a loaded group when it has no matching event rows.
- If an unloaded group is later loaded and has no matches, it may disappear from the filtered view.

Filtering should not suppress a matching descendant merely because its parent workflow or execution does not directly match an event filter.

## Sorting

Display sibling lifecycle rows oldest first by their initiating event; no reverse-order control is required for the scene redesign.

Ordering must preserve:

- Workflow hierarchy
- Parent-child relationships
- Chronological continue-as-new execution order
- Event order inside a lifecycle group

Executions remain visually distinct but do not become separate hierarchy levels solely because they have different run IDs.

## Loading and Failure Behavior

### Execution repository

Workflow metadata and histories should be cached per execution using an execution-qualified key containing:

- Namespace
- Workflow ID
- Run ID

Each execution owns its own canonical event storage, grouped-event projection, loading state, pending metadata, and content version.

The current single-run event-buffer concepts remain useful, including:

- Canonical events stored once
- Arrival-order-independent group assembly
- Cross-source deduplication
- Lazy group materialization
- Stable identity plus content versions

However, the buffer cannot remain a single module-level timeline resource when multiple executions are displayed simultaneously.

### Lazy loading

- Load the current execution immediately and follow its forward continue-as-new chain through the latest discoverable run.
- Discover other related execution metadata separately from full histories when possible.
- Load expanded child histories on demand.
- Load histories approaching the horizontal or vertical viewport when needed.
- Limit concurrent child-history requests.
- Abort obsolete requests when the root workflow or expansion state changes.
- Live-poll running executions that are actively represented.
- Treat closed loaded executions as immutable and cacheable.

Default-expanded children should not cause an unbounded fetch storm. Loading must remain concurrency-limited and may be deferred until the child approaches the rendered viewport.

### Child load failures

A child history failure must not fail the parent timeline.

Keep the child's box visible and render a compact error row with a retry action inside it (confirmed for the scene redesign). An error must remain distinguishable from a successfully loaded execution with no matching events.

## Virtualization and Performance

The initial architecture should use independent vertical virtualization and horizontal culling rather than a generic two-dimensional grid virtualizer.

### Vertical virtualization

- Virtualize the flattened visible row list.
- Include overscan above and below the viewport.
- Use stable execution-qualified row keys.
- Expansion and collapse rebuild the flattened row list without changing the underlying execution graph.
- Structural decoration bounds are computed independently of mounted row DOM.

### Horizontal culling

For vertically visible rows:

- Project events and intervals through the shared time viewport.
- Render only primitives intersecting the visible time range, plus horizontal overscan.
- Render only visible axis ticks.
- Cull workflow, execution, and relationship decorations using their time intervals.

A more sophisticated two-dimensional spatial index should be added only if profiling demonstrates that horizontal culling over the vertically visible rows is insufficient.

### Smooth interaction

During active pan or zoom:

- Coalesce updates with `requestAnimationFrame`.
- Avoid rebuilding the execution graph.
- Avoid refetching data for every pointer movement.
- Prefer transform or projection updates over DOM reconstruction, but do not use lagging JavaScript-driven scroll updates to position sticky labels.
- Perform heavier culling and preloading work after or near the end of movement when possible.

## Identity and Selection

All identities exposed to layout, selection, caching, accessibility, and rendering must be execution-qualified because event IDs restart for each workflow run.

Selection for the initial scene should identify an execution or lifecycle group. An individual event mark selects its containing lifecycle group; individual event details are accessible within that group's inspector. Workflow-level or individual-event selection can be revisited later if needed.

Selection state belongs outside pooled row positions and must remain stable while rows are recycled or temporarily virtualized out of the DOM.

## Accessibility and Keyboard Navigation

Defer custom tree keyboard navigation until the redesigned scene's visual layout is settled. Keep native keyboard access to interactive controls and the details overlay in the meantime. The eventual tree model should support:

- Up/down navigate visible rows.
- Left collapses a group or moves to its parent.
- Right expands a group or moves to its first child.
- Enter selects the row and opens the inspector.
- Home/end may navigate to the first or last visible row.

Do not use a treegrid unless the design later gains actual semantic columns.

Virtualization must preserve logical focus using stable, execution-qualified row IDs. A container-owned focus model using `aria-activedescendant` should be considered so a recycled DOM row cannot silently change the identity of the focused item.

Accessible row labels should include enough context to identify the workflow or execution, event type, status, time, and duration without relying on visual position alone.

## View State and URL State

Viewport and expansion state do not need to be represented in the URL in the initial implementation.

The state model should nevertheless be serializable so URL persistence can be added later. Potentially serializable state includes:

- Viewport start or anchor time
- Viewport duration
- Follow-latest state
- Selected entity
- Child and continue-as-new depth settings
- Expansion state

Individual expansion keys may remain session-local if serializing them would produce excessively large URLs.

## Architectural Direction

The intended data flow is:

1. An execution repository loads and caches workflow metadata and histories.
2. A relationship graph connects child and continue-as-new executions.
3. Expansion, filtering, and sorting derive a visible scene tree.
4. The scene tree is flattened into virtualizable rows and structural decorations.
5. A global time domain feeds separate minimap and plotting projections.
6. Vertical virtualization and horizontal culling determine what is rendered.
7. Selection opens an inspector outside the plot.

Do not implement inline children by recursively nesting independent timeline components. All displayed workflows must share the same global time domain and horizontal viewport.

## Suggested Implementation Order

This original architectural roadmap is retained for background. The confirmed scene-redesign requirements above supersede its visual details and implementation order; new work remains isolated in `src/lib/workflow-timeline/` rather than modifying the legacy timeline.

1. Add the disabled-by-default `?new_timeline=true` route opt-in and an empty new timeline entry point while preserving the legacy path.
2. Build a single-execution vertical slice with a linear pannable and zoomable time viewport.
3. Add the minimap and follow-latest behavior.
4. Introduce execution-qualified identities and the multi-execution repository.
5. Render a continue-as-new chain on the shared time axis.
6. Introduce the flattened hierarchical row model and structural decoration layers.
7. Add inline child workflows with lazy history loading and isolated errors.
8. Add filtering, sibling sorting, tree keyboard navigation, and the external inspector.
9. Establish behavior and performance parity criteria before considering legacy removal or shared extraction.
10. Profile real large histories before introducing more complex horizontal indexing.

## Scene Redesign: Open Choices and Follow-ups

The visual and interaction requirements above are confirmed unless explicitly marked tentative. The following still need tuning or visual review:

- Heuristic for the initial window duration of a running workflow, plus zoom limits and the live-edge snap/unpin thresholds.
- Precise geometry of time-bounded boxes with embedded sticky labels, including how a child box can extend beyond its parent's right edge without creating layout problems. Labels must never visibly lag behind native scrolling.
- Whether to keep labels visible when their entire lifecycle mark is outside the viewport; start with visible edge-pinned labels and review in the actual scene.
- Collapsed child presentation; start with a compact single row and review in the actual scene.
- Minimap styling: show event density, then test whether execution and child spans improve orientation or add clutter.
- Exact bottom-overlay height; review whether mobile eventually needs a larger modal-like details view.
- Exact visuals for an ongoing execution; start with the legacy-style animated dashed continuation.
- Whether unusually large direct child counts need a different default expansion policy once the persistent expand-by-default preference exists.
- Initial URL encoding for viewport or expansion state, if added later.

For the initial redesign, prioritize a graph-like scene with legible in-mark labels, time-bounded nested outline boxes, legacy-style per-event marks, a fixed minimap, native scrolling without label catch-up, and stable live/closed viewport behavior. Defer filters, custom tree keyboard navigation, and full control styling until the scene itself is convincing.
