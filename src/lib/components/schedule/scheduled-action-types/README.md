# Scheduled action types

Schedules own timing, schedule policies, and schedule attributes. Each action type
owns its fields, validation, API mapping, and presentation. Keep action-specific
behavior in its directory rather than adding it to shared schedule components.
Use `workflow/` as the reference implementation.

## Organization

- `schema.ts`, `types.ts`, `action.ts`, `request-mappings.ts`: the action's data
  contract, constraints, detection, and request conversion.
- `presentation/form/`: create/edit components and initialization helpers.
- `presentation/view/`: read-only details, execution history, and related helpers.
- `presentation/schedules-list/`: cells for the schedules table.
- `presentation/index.ts`: component references and UI metadata, checked against
  `ScheduledActionPresentation` and registered in `presentation-registry.ts`.

## Adding an action type

1. Create its directory with a schema, narrowed API types, detection, and request
   mapper. Extend the form-data, supported-action, and list-entry unions in this
   directory's shared `types.ts`.
2. Update the shared `resolve-scheduled-action.ts`,
   `resolve-scheduled-action-list-entry.ts`, and `request-mappings.ts` to delegate
   to the new action type. Full schedule descriptions and list entries have
   separate API shapes and detection paths.
3. Implement and register its presentation:
   - `form`: a component exporting `validate()`, bound search attributes, and tab
     metadata. Report action-specific summary rows through `onSummaryChange`.
   - `view`: header, details, advanced-settings content, input/runs cards, and
     search-attribute rendering/counting.
   - `schedulesList`: `TypeCell`, `RecentRunsCell`, and `getTypeSortValue()`.
4. Expose the action type in the schedule creation UI.

## Component contracts

- `schedule: null` means creation. Forms accept nullable schedules; read-only
  components require a narrowed, non-null schedule.
- Unrecognized existing actions resolve to `type: 'unknown'` and cannot be
  submitted. Unknown is not a selectable action type.
- The shared schedule form owns the HTML form and coordinates schedule/action
  validation and submission. Each action form owns its validation.
- Components named `Card` own their container; other components are composed into
  shared layouts.
- Resolution and request mapping are independent of presentation. Only UI
  consumers import the presentation registry.
