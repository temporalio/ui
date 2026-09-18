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
- Support accessible keyboard navigation through the logical workflow hierarchy.

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

### Follow latest

The viewport can follow the right edge of the known time domain, such as the last hour relative to `now`.

- New activity keeps the latest known time pinned to the right edge while follow-latest is enabled.
- Manual panning or zooming disables follow-latest.
- Re-enabling follow-latest returns the viewport to the latest known interval while preserving the selected viewport duration.

## Minimap

The minimap displays the full known bounds of the root execution graph.

- Execution metadata may extend the minimap bounds without requiring full history loading.
- The known domain may expand as additional related executions are discovered.
- A running graph uses `now` as its moving right boundary.
- Collapsing or expanding workflow groups does not change known global bounds.
- The minimap shows and controls the main plotting viewport.
- The minimap supports dragging the viewport window and changing its duration to zoom.

The minimap and plotting area use separate projections over the same global time domain:

- The minimap always displays the complete known domain.
- The plotting area displays only the currently selected time interval.

## Workflow and Execution Hierarchy

### Logical hierarchy

Workflows provide the logical nesting hierarchy. Executions in a continue-as-new chain belong to the same workflow level and do not introduce additional hierarchy depth.

A child workflow is nested within its parent workflow. The child's continue-as-new executions remain inside the child workflow's visual group.

Visual grouping must support arbitrary nesting of workflow, execution, and event collections.

### Default expansion and depth

Child expansion is configurable and defaults to enabled.

Initial depth defaults are:

- `childWorkflowDepth = 1`
- `continuedRunDepthBefore = 1`
- `continuedRunDepthAfter = unbounded`, through the latest known run

These are independent settings. The architecture must support greater child depth and different continue-as-new depths later.

An unbounded forward continue-as-new depth does not imply eager history loading:

- Discover metadata through the latest known run.
- Load full histories lazily when required by expansion or viewport visibility.
- Do not fetch every execution history solely because the forward depth is unbounded.

### Collapsed workflows

A collapsed child workflow contributes:

- A compact summary row to vertical layout
- Its known execution interval to the global time domain and minimap

Its hidden descendant rows do not contribute vertical height. Collapsing a workflow must not change the global time bounds.

### Pending children

Do not render a pending child workflow until a started event or equivalent execution identity is available.

## Plotting and Visual Layout

### Flattened row model

The logical execution graph should be flattened into a list of visible rows for layout and virtualization. Rows should use stable, execution-qualified identities.

Expected row types include:

- Workflow summary/header
- Execution/run summary
- Event lifecycle group
- Loading state
- Error state

Rows should remain fixed-height where possible. Workflow and execution containers can visually span multiple rows without being literal nested DOM containers.

### Decoration layers

Render structural visuals separately from event rows, including:

- Workflow boundaries
- Execution/run boundaries
- Parent-child connectors
- Continue-as-new connectors
- Group backgrounds

Decoration geometry should be derived from subtree row ranges and execution time intervals. This allows structural containers to remain visible when some descendant rows are virtualized.

### Event details

Selecting an event or lifecycle group opens an external inspector. Details must not be inserted into the plotting rows or shift timeline content.

The exact presentation may be:

- A side panel on larger screens
- A bottom panel or drawer on smaller screens

The timeline renderer should only manage selection. Inspector placement belongs to the surrounding layout.

## Filtering

Filters apply only to already loaded event rows. Filtering must not trigger additional execution-history fetches.

Structural behavior:

- Preserve workflow and execution structure around matching event rows.
- Retain unloaded structural groups because their match state is unknown.
- Retain a collapsed group when its loaded descendants contain matches.
- Remove a loaded group when it has no matching event rows.
- If an unloaded group is later loaded and has no matches, it may disappear from the filtered view.

Filtering should not suppress a matching descendant merely because its parent workflow or execution does not directly match an event filter.

## Sorting

Ascending or descending sorting applies to sibling rows within each workflow group.

Sorting must preserve:

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

- Load the current execution immediately.
- Discover related execution metadata separately from full histories when possible.
- Load expanded child histories on demand.
- Load histories approaching the horizontal or vertical viewport when needed.
- Limit concurrent child-history requests.
- Abort obsolete requests when the root workflow or expansion state changes.
- Live-poll running executions that are actively represented.
- Treat closed loaded executions as immutable and cacheable.

Default-expanded children should not cause an unbounded fetch storm. Loading must remain concurrency-limited and may be deferred until the child approaches the rendered viewport.

### Child load failures

A child history failure must not fail the parent timeline.

Keep the child's structural group visible and render a compact error row with a retry action. An error must remain distinguishable from a successfully loaded execution with no matching events.

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
- Prefer transform or projection updates over DOM reconstruction.
- Perform heavier culling and preloading work after or near the end of movement when possible.

## Identity and Selection

All identities exposed to layout, selection, caching, accessibility, and rendering must be execution-qualified because event IDs restart for each workflow run.

Selection should distinguish at least:

- Workflow
- Execution/run
- Event lifecycle group
- Individual event

Selection state belongs outside pooled row positions and must remain stable while rows are recycled or temporarily virtualized out of the DOM.

## Accessibility and Keyboard Navigation

Use a tree navigation model for the logical workflow hierarchy.

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

All phases below are implemented in `src/lib/workflow-timeline/`; they do not incrementally modify the legacy timeline.

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

## Deferred Design Details

The following can be finalized during implementation without changing the core architecture:

- Exact inspector placement and resizing behavior
- Exact zoom limits and pointer/trackpad gestures
- Minimap sparkline or density rendering style
- Visual styling for workflow, execution, and relationship boundaries
- Whether workflows with extremely large direct child counts override default expansion
- Initial URL encoding for viewport or expansion state
