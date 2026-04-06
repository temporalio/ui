# Temporal UI Schedule API Types & Form Redesign Reference

## API Source Types (Proto-generated from @temporalio/proto)

All Schedule API types are imported from proto definitions via `temporal.api.schedule.v1` and `temporal.api.workflowservice.v1`.

### Core Schedule Types

**File:** `/Users/alex.tideman/Temporal/ui/src/lib/types/index.ts`

```typescript
// Main API types (proto-generated)
export type Schedule = temporal.api.schedule.v1.ISchedule;
export type CreateScheduleRequest =
  temporal.api.workflowservice.v1.ICreateScheduleRequest;
export type PatchScheduleRequest =
  temporal.api.workflowservice.v1.IPatchScheduleRequest;
export type UpdateScheduleRequest =
  temporal.api.workflowservice.v1.IUpdateScheduleRequest;
export type ScheduleListEntry = temporal.api.schedule.v1.IScheduleListEntry;
export type ScheduleSpec = temporal.api.schedule.v1.IScheduleSpec;
export type ScheduleState = temporal.api.schedule.v1.IScheduleState;
export type SchedulePolicies = temporal.api.schedule.v1.ISchedulePolicies;
export type CalendarSpec = temporal.api.schedule.v1.ICalendarSpec;
export type StructuredCalendarSpec =
  temporal.api.schedule.v1.IStructuredCalendarSpec;
export type IntervalSpec = temporal.api.schedule.v1.IIntervalSpec;
export type RangeSpec = temporal.api.schedule.v1.IRange;
export type ScheduleActionResult =
  temporal.api.schedule.v1.IScheduleActionResult;
```

### Custom Type Aliases

**File:** `/Users/alex.tideman/Temporal/ui/src/lib/types/schedule.ts`

```typescript
export type OverlapPolicy =
  | 'Unspecified'
  | 'Skip'
  | 'BufferOne'
  | 'BufferAll'
  | 'CancelOther'
  | 'TerminateOther'
  | 'AllowAll';

export type SchedulePreset =
  | 'existing'
  | 'interval'
  | 'week'
  | 'month'
  | 'string';
export type ScheduleStatus = 'Paused' | 'Running';
export type ScheduleOffsetUnit = 'days' | 'hrs' | 'min' | 'sec';
```

## Current Form Schema

**File:** `/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-form/schema.ts`

### Currently Captured Fields

- name, workflowType, workflowId, taskQueue (workflow action)
- input, editInput, encoding, messageType (workflow input/payload)
- daysOfWeek, daysOfMonth, months, days, hour, minute, second, phase (spec)
- cronString (cron spec)
- preset (form mode selector)
- timezoneName (spec timezone - **ALREADY CAPTURED**)
- searchAttributes (schedule-level)
- workflowSearchAttributes (workflow-level)

### Missing Form Fields (NOT IN CURRENT SCHEMA)

These need to be added for the form redesign:

1. **startTime** - spec.startTime (timestamp string)
2. **endTime** - spec.endTime (timestamp string)
3. **jitter** - spec.jitter (duration)
4. **catchupWindow** - policies.catchupWindow (duration)
5. **pauseOnFailure** - policies.pauseOnFailure (boolean)
6. **keepOriginalWorkflowId** - policies.keepOriginalWorkflowId (boolean)
7. **overlapPolicy** - policies.overlapPolicy (enum: OverlapPolicy)
8. **remainingActions** - state.remainingActions (number, displayed only in view)
9. **limitedActions** - state.limitedActions (boolean, if true shows remaining actions)

### Multiple Spec Types (Currently under preset selection)

The spec supports multiple concurrent schedule definitions:

- **calendar[]** - Array of CalendarSpec (day-of-week, day-of-month patterns)
- **interval[]** - Array of IntervalSpec (periodic intervals)
- **cronString[]** - Array of cron strings
- **structuredCalendar[]** - Array of StructuredCalendarSpec (calendar variant)
- **excludeCalendar[]** - Array of CalendarSpec for exclusions

## Component Files Reference

### Schedule Display (View Page)

- **/Users/alex.tideman/Temporal/ui/src/lib/pages/schedule-view.svelte** - Main schedule detail page
  - Shows all policy fields (line 95-105): overlapPolicy, catchupWindow, pauseOnFailure, keepOriginalWorkflowId
  - Shows state fields (line 105-115): limitedActions, remainingActions
  - Uses RadioInput for OverlapPolicy selection in trigger/backfill modals
  - Uses DatePicker and TimePicker for backfill date/time ranges

### Schedule Advanced Settings (Display)

- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-advanced-settings.svelte** - Currently shows:
  - startTime, endTime, jitter (from spec)
  - exclusion calendar
  - remaining actions (if limitedActions)
  - overlapPolicy, catchupWindow, pauseOnFailure, keepOriginalWorkflowId (from policies)

### Schedule Form Components

- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-form/form.svelte** - Main form wrapper
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-form/schedules-calendar-view.svelte** - Tabbed schedule spec selector
  - Tabs: Existing, Interval, Days of Week, Days of Month, String (Cron)
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-form/schedule-input-payload.svelte** - Workflow input/payload editor
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-frequency.svelte** - Display current spec with timezone
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-day-of-week-view.svelte** - Weekly schedule picker
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedule-day-of-month-view.svelte** - Monthly schedule picker
- **/Users/alex.tideman/Temporal/ui/src/lib/components/schedule/schedules-interval-view.svelte** - Interval duration picker

## Holocene Design System Components Available

### Date/Time Inputs

- **DatePicker** (`src/lib/holocene/date-picker.svelte`) - Calendar popup, MM/DD/YY format
- **TimePicker** (`src/lib/holocene/time-picker.svelte`) - Hour/Min/Sec with AM/PM or 24h
- **DayOfWeekPicker** (`src/lib/holocene/day-of-week-picker.svelte`) - Day selection grid
- **DayOfMonthPicker** (`src/lib/holocene/day-of-month-picker.svelte`) - Monthly date selection
- **MonthPicker** (`src/lib/holocene/month-picker.svelte`) - Month selection
- **Calendar** (`src/lib/holocene/calendar.svelte`) - Calendar widget (internal)
- **DurationInput** (`src/lib/holocene/duration-input/duration-input.svelte`) - Duration input with units

### Selection Components

- **Select** (`src/lib/holocene/select/select.svelte`) - Multi-option dropdown
- **SimpleSelect** (`src/lib/holocene/select/simple-select.svelte`) - Simple dropdown
- **FilterSelect** (`src/lib/holocene/select/filter-select.svelte`) - Searchable select
- **MultiSelect** (`src/lib/holocene/select/multi-select.svelte`) - Multi-select dropdown
- **Combobox** (`src/lib/holocene/combobox/combobox.svelte`) - Autocomplete combobox
- **RadioGroup** + **RadioInput** (`src/lib/holocene/radio-input/`) - Radio button groups
- **Checkbox** (`src/lib/holocene/checkbox.svelte`) - Checkbox inputs
- **ToggleSwitch** (`src/lib/holocene/toggle-switch.svelte`) - Toggle switches
- **ToggleButton** (`src/lib/holocene/toggle-button/toggle-button.svelte`) - Toggle button

### Info/Help Components

- **Tooltip** (`src/lib/holocene/tooltip.svelte`) - Hover tooltips
- **Icon** (`src/lib/holocene/icon/icon.svelte`) - Icon component (with names like "info", "chevron-left", etc.)
- **Label** (`src/lib/holocene/label.svelte`) - Form labels
- **Input** (`src/lib/holocene/input/input.svelte`) - Text input with hints/errors

### Layout Components

- **Card** (`src/lib/holocene/card.svelte`) - Card container
- **Accordion** (`src/lib/holocene/accordion/accordion.svelte`) - Collapsible sections
- **Modal** (`src/lib/holocene/modal.svelte`) - Modal dialogs
- **Alert** (`src/lib/holocene/alert.svelte`) - Alert/warning messages
- **Tabs** + **Tab** + **TabPanel** - Tab navigation

## API Fields Deep Dive (from proto)

### ScheduleSpec Fields (temporal.api.schedule.v1.IScheduleSpec)

- **calendar?: CalendarSpec[]** - Calendar-based schedules (day of week/month patterns)
- **interval?: IntervalSpec[]** - Interval-based schedules
- **cronString?: string[]** - Cron expression strings
- **startTime?: string** - RFC3339 timestamp for schedule start (currently displayed, not in form)
- **endTime?: string** - RFC3339 timestamp for schedule end (currently displayed, not in form)
- **jitter?: Duration** - Random delay applied to schedule (currently displayed, not in form)
- **timezoneName?: string** - IANA timezone name (ALREADY IN FORM)
- **excludeCalendar?: CalendarSpec[]** - Exclusion patterns
- **structuredCalendar?: StructuredCalendarSpec[]** - Alternative calendar format

### SchedulePolicies Fields (temporal.api.schedule.v1.ISchedulePolicies)

- **overlapPolicy?: OverlapPolicy enum** - How to handle overlapping executions
- **catchupWindow?: Duration** - Backfill window for missed executions (currently displayed, not in form)
- **pauseOnFailure?: boolean** - Pause schedule on workflow failure (currently displayed, not in form)
- **keepOriginalWorkflowId?: boolean** - Reuse workflow ID (currently displayed, not in form)

### ScheduleState Fields (temporal.api.schedule.v1.IScheduleState)

- **paused?: boolean** - Whether schedule is paused
- **notes?: string** - Schedule notes
- **limitedActions?: boolean** - If true, schedule has max actions limit
- **remainingActions?: number** - Number of remaining actions (if limited)
- **lastActionTime?: string** - Timestamp of last triggered action
- **nextActionTime?: string** - Timestamp of next scheduled action

## Summary of Missing Form Fields for Redesign

Need to add form sections for:

1. **Schedule Time Boundaries** (startTime, endTime) - DatePicker + TimePicker pair
2. **Jitter/Randomization** (jitter) - DurationInput component
3. **Overlap Handling** (overlapPolicy) - RadioGroup with 7 options (already used in modals)
4. **Execution Policies** (catchupWindow, pauseOnFailure, keepOriginalWorkflowId) - Duration input, toggle, checkbox
5. **Action Limits** (limitedActions, remainingActions) - Checkbox + number input (remaining is view-only)

All proto types are accessible via temporal.api.schedule.v1.\* interfaces.
Holocene provides all needed UI components for these fields.
