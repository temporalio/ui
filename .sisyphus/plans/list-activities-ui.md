# List Activities UI Implementation Plan

## Summary

Build a full-featured UI for listing standalone activities that mirrors the Workflows UI. This includes:

- Activity counts by status
- Filtering with search attributes
- Saved Views (activity-specific storage)
- Configurable columns table
- Batch operations (Cancel, Terminate)
- Pagination

## Requirements

### Functional Requirements

1. **Activity Counts**: Display status-based count chips (Running, Completed, Failed, Canceled, Terminated, Timed Out)
2. **Filtering**: Use same search attribute system as workflows with query parameter
3. **Saved Views**: Activity-specific saved views with separate localStorage key
4. **Configurable Table**: Columns: Status, Activity ID, Activity Type, Task Queue, Start Time, Close Time, Attempt, Last Worker Identity, Execution Duration
5. **Batch Operations**: Support Cancel and Terminate operations
6. **Pagination**: Use `nextPageToken` pattern like workflows

### Activity Statuses (from proto)

- `ACTIVITY_EXECUTION_STATUS_RUNNING`
- `ACTIVITY_EXECUTION_STATUS_COMPLETED`
- `ACTIVITY_EXECUTION_STATUS_FAILED`
- `ACTIVITY_EXECUTION_STATUS_CANCELED`
- `ACTIVITY_EXECUTION_STATUS_TERMINATED`
- `ACTIVITY_EXECUTION_STATUS_TIMED_OUT`

## Acceptance Criteria

- [ ] Activity list page shows status counts at the top
- [ ] Filter bar allows filtering by search attributes
- [ ] Saved Views panel works independently from workflow views
- [ ] Table displays configurable columns with drag/reorder
- [ ] Batch cancel/terminate works for selected activities
- [ ] Pagination works with next/previous navigation
- [ ] "Start Activity" button links to start activity form
- [ ] All i18n strings are properly translated

## Implementation Steps

### Phase 1: Core Infrastructure (Services & Stores)

#### Step 1.1: Update standalone-activities service

**File**: `src/lib/services/standalone-activities.ts`

- Add `fetchPaginatedActivities(namespace, query)` function matching workflow pattern
- Add `fetchActivityCounts(namespace, query)` function for status counts
- Support query parameters: `query`, `pageSize`, `nextPageToken`

#### Step 1.2: Create activity stores

**File**: `src/lib/stores/activities.ts` (NEW)

- Create `activityCount` store (similar to `workflowCount`)
- Create `activitiesQuery` store
- Create `activitiesSearchParams` store
- Create `activityRefresh` store
- Create `activityFilters` store (similar to `workflowFilters`)

#### Step 1.3: Create activity saved queries store

**File**: `src/lib/stores/saved-queries.ts`

- Add `savedActivityQueries` persist store with key `'saved-activity-queries'`
- Add `systemActivityViews` constant with default views (All, Running, Completed, Failed)
- Add `MAX_SAVED_ACTIVITY_QUERIES` constant

#### Step 1.4: Create activity configurable columns store

**File**: `src/lib/stores/configurable-table-columns.ts`

- Add `TABLE_TYPE.ACTIVITIES = 'activities'`
- Add `DEFAULT_ACTIVITIES_COLUMNS` array
- Add `DEFAULT_AVAILABLE_ACTIVITIES_COLUMNS` array
- Add `persistedActivitiesTableColumns` persist store
- Add `availableActivityColumns` derived store
- Update `configurableTableColumns` to include activities
- Update reducer to handle activities table type

### Phase 2: Activity Counts Component

#### Step 2.1: Create activity counts service

**File**: `src/lib/services/activity-counts.ts` (NEW)

- Create `fetchActivityCountsByStatus(namespace, query)` function
- Return counts per status: { running, completed, failed, canceled, terminated, timedOut }

#### Step 2.2: Create activity counts component

**File**: `src/lib/components/activity/activity-counts.svelte` (NEW)

- Display status count chips similar to `workflow-counts.svelte`
- Clicking a status filters the list
- Auto-refresh on interval

#### Step 2.3: Create activity count refresh component

**File**: `src/lib/components/activity/activity-count-refresh.svelte` (NEW)

- Show "X new activities" badge when count changes
- Click to refresh the list

### Phase 3: Filter Bar (Activity-specific)

#### Step 3.1: Create activity filter bar

**File**: `src/lib/components/activity/filter-bar/index.svelte` (NEW)

- Duplicate workflow filter-bar structure
- Use `activityFilters` store instead of `workflowFilters`

#### Step 3.2: Create activity filter component

**File**: `src/lib/components/activity/filter-bar/filter.svelte` (NEW)

- Same pattern as workflow filter
- Use activity-specific context

#### Step 3.3: Create supporting filter components

**Files** (NEW):

- `src/lib/components/activity/filter-bar/dropdown-filter-list.svelte`
- `src/lib/components/activity/filter-bar/search-attribute-menu.svelte`
- `src/lib/components/activity/filter-bar/manual-query.svelte`

### Phase 4: Saved Views (Activity-specific)

#### Step 4.1: Create activity saved views component

**File**: `src/lib/pages/saved-activity-views.svelte` (NEW)

- Duplicate `saved-query-views.svelte` pattern
- Use `savedActivityQueries` store
- Use `activityFilters` instead of `workflowFilters`
- Use `systemActivityViews` for default views

#### Step 4.2: Create activity view modals

**Files** (NEW):

- `src/lib/components/activity/filter-bar/save-view-modal.svelte`
- `src/lib/components/activity/filter-bar/edit-view-modal.svelte`

### Phase 5: Configurable Table

#### Step 5.1: Create activity table component

**File**: `src/lib/components/activity/activities-summary-configurable-table.svelte` (NEW)

- Use `PaginatedTable` component
- Fetch via `fetchPaginatedActivities`
- Support column configuration

#### Step 5.2: Create table cell components

**Files** (NEW):

- `src/lib/components/activity/activities-summary-configurable-table/table-header-row.svelte`
- `src/lib/components/activity/activities-summary-configurable-table/table-header-cell.svelte`
- `src/lib/components/activity/activities-summary-configurable-table/table-row.svelte`
- `src/lib/components/activity/activities-summary-configurable-table/table-body-cell.svelte`
- `src/lib/components/activity/activities-summary-configurable-table/table-empty-state.svelte`

#### Step 5.3: Create activity table column values

**File**: `src/lib/components/activity/activities-summary-configurable-table/get-activity-table-column-value.ts` (NEW)

- Map column labels to activity property values
- Handle Status, Activity ID, Activity Type, Task Queue, Start Time, Close Time, Attempt, Last Worker Identity, Execution Duration

#### Step 5.4: Create configurable table headers drawer

**File**: `src/lib/components/activity/configurable-table-headers-drawer/index.svelte` (NEW)

- Duplicate workflow pattern for activity columns

### Phase 6: Batch Operations

#### Step 6.1: Create activity batch service functions

**File**: `src/lib/services/activity-batch-service.ts` (NEW)

- `batchCancelActivities(options)` function
- `batchTerminateActivities(options)` function
- Use activity-specific API endpoints

#### Step 6.2: Create batch operation modals

**Files** (NEW):

- `src/lib/components/activity/client-actions/batch-cancel-confirmation-modal.svelte`
- `src/lib/components/activity/client-actions/batch-terminate-confirmation-modal.svelte`
- `src/lib/components/activity/client-actions/batch-operation-confirmation-form.svelte`

#### Step 6.3: Create single activity action modals

**Files** (NEW):

- `src/lib/components/activity/client-actions/cancel-confirmation-modal.svelte`
- `src/lib/components/activity/client-actions/terminate-confirmation-modal.svelte`

### Phase 7: Main Page Component

#### Step 7.1: Create activities list page component

**File**: `src/lib/pages/activities-with-search.svelte` (NEW)

- Main page component combining all features
- Set up batch operation context
- Include:
  - Activity counts header
  - Filter bar
  - Saved views panel
  - Configurable table
  - Batch operation modals
  - Configurable columns drawer

#### Step 7.2: Update route page

**File**: `src/routes/(app)/namespaces/[namespace]/activities/+page.svelte`

- Replace `ActivityExecutions` with `ActivitiesWithSearch`

### Phase 8: Types & Utilities

#### Step 8.1: Add activity-specific types

**File**: `src/lib/types/activities.ts` (NEW)

- `ActivityListItem` type for list view
- `ActivityTableColumn` type
- `ActivityBatchOperationContext` type

#### Step 8.2: Update route-for-api

**File**: `src/lib/utilities/route-for-api.ts`

- Ensure activity list endpoint supports query parameters

#### Step 8.3: Add i18n translations

**File**: `src/lib/i18n/locales/en/activities.ts`

- Add translations for:
  - Status labels
  - Column headers
  - Batch operation messages
  - Empty states
  - Filter labels

#### Step 8.4: Create activity query utilities

**File**: `src/lib/utilities/query/to-list-activity-filters.ts` (NEW)

- Parse query string to activity filters
- Convert filters to query string

### Phase 9: Integration & Polish

#### Step 9.1: Add activity status utilities

**File**: `src/lib/utilities/activity-status.ts` (NEW)

- `getActivityStatusColor(status)` function
- `getActivityStatusLabel(status)` function
- `isActivityTerminable(activity)` function
- `isActivityCancelable(activity)` function

#### Step 9.2: Update nav-open store

**File**: `src/lib/stores/nav-open.ts`

- Add `savedActivityNavOpen` store for activity views panel

#### Step 9.3: Create activity row selection utilities

**File**: `src/lib/utilities/activity-selection.ts` (NEW)

- Functions for determining which activities can be batch operated

## File Summary

### New Files (37 files)

1. `src/lib/stores/activities.ts`
2. `src/lib/services/activity-counts.ts`
3. `src/lib/services/activity-batch-service.ts`
4. `src/lib/types/activities.ts`
5. `src/lib/utilities/activity-status.ts`
6. `src/lib/utilities/activity-selection.ts`
7. `src/lib/utilities/query/to-list-activity-filters.ts`
8. `src/lib/components/activity/activity-counts.svelte`
9. `src/lib/components/activity/activity-count-refresh.svelte`
10. `src/lib/components/activity/filter-bar/index.svelte`
11. `src/lib/components/activity/filter-bar/filter.svelte`
12. `src/lib/components/activity/filter-bar/dropdown-filter-list.svelte`
13. `src/lib/components/activity/filter-bar/search-attribute-menu.svelte`
14. `src/lib/components/activity/filter-bar/manual-query.svelte`
15. `src/lib/components/activity/filter-bar/save-view-modal.svelte`
16. `src/lib/components/activity/filter-bar/edit-view-modal.svelte`
17. `src/lib/components/activity/activities-summary-configurable-table.svelte`
18. `src/lib/components/activity/activities-summary-configurable-table/table-header-row.svelte`
19. `src/lib/components/activity/activities-summary-configurable-table/table-header-cell.svelte`
20. `src/lib/components/activity/activities-summary-configurable-table/table-row.svelte`
21. `src/lib/components/activity/activities-summary-configurable-table/table-body-cell.svelte`
22. `src/lib/components/activity/activities-summary-configurable-table/table-empty-state.svelte`
23. `src/lib/components/activity/activities-summary-configurable-table/get-activity-table-column-value.ts`
24. `src/lib/components/activity/configurable-table-headers-drawer/index.svelte`
25. `src/lib/components/activity/client-actions/batch-cancel-confirmation-modal.svelte`
26. `src/lib/components/activity/client-actions/batch-terminate-confirmation-modal.svelte`
27. `src/lib/components/activity/client-actions/batch-operation-confirmation-form.svelte`
28. `src/lib/components/activity/client-actions/cancel-confirmation-modal.svelte`
29. `src/lib/components/activity/client-actions/terminate-confirmation-modal.svelte`
30. `src/lib/pages/activities-with-search.svelte`
31. `src/lib/pages/saved-activity-views.svelte`

### Modified Files (6 files)

1. `src/lib/stores/saved-queries.ts` - Add activity saved queries
2. `src/lib/stores/configurable-table-columns.ts` - Add activities table type
3. `src/lib/stores/filters.ts` - Add activity filters
4. `src/lib/stores/nav-open.ts` - Add activity nav state
5. `src/lib/services/standalone-activities.ts` - Add paginated fetch
6. `src/lib/i18n/locales/en/activities.ts` - Add translations
7. `src/routes/(app)/namespaces/[namespace]/activities/+page.svelte` - Use new component

## Risks & Mitigations

### Risk 1: API Not Ready

The ListActivities API may not be fully implemented on the server.
**Mitigation**: Build UI to gracefully handle missing/incomplete API responses. Add feature flag if needed.

### Risk 2: Search Attribute Compatibility

Activity search attributes may differ from workflow search attributes.
**Mitigation**: Use same search attribute system initially; can customize later as needed.

### Risk 3: Batch Operations API

Batch operations for activities may use different endpoints than workflows.
**Mitigation**: Create separate service functions that can be updated when API is finalized.

## Verification Steps

1. Run `pnpm lint` - should pass
2. Run `pnpm check` - should pass
3. Run `pnpm test -- --run` - should pass
4. Manual testing:
   - Navigate to activities list page
   - Verify counts display correctly
   - Test filtering with various search attributes
   - Create and delete saved views
   - Reorder table columns
   - Select activities and perform batch cancel/terminate
   - Test pagination navigation

## Dependencies

- Temporal server with ListActivities API support
- Existing workflow UI components (for reference patterns)
- Holocene design system components
