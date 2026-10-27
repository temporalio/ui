# Using io-ark components

Guidance for teams, and their agents, building apps with the io-ark components from `@temporalio/ui`. Each component also has a contract next to it with the full rules (see [Contracts](#contracts)). Building or changing the components themselves? Read [CONTRIBUTING.md](CONTRIBUTING.md) instead.

## Setup

- Import each component from its own entry point: `import { Button } from '@temporalio/ui/io-ark/button';`. There is no combined barrel.
- The components are Svelte 5 components (`svelte` is a peer dependency) built on Ark UI, which ships as a dependency.
- Styles are Tailwind classes using Temporal's theme tokens. Add the preset and let Tailwind scan the package, or the classes are never generated. io-ark uses icons and badges from the `io` folder, so scan both:

  ```js
  import temporal from '@temporalio/ui/theme/preset';

  export default {
    presets: [temporal],
    content: [
      './src/**/*.{html,js,svelte,ts}',
      './node_modules/@temporalio/ui/dist/io-ark/**/*.{js,svelte}',
      './node_modules/@temporalio/ui/dist/io/**/*.{js,svelte}',
    ],
  };
  ```

- The light theme applies on `:root`. Set `data-theme="dark"` on `<html>` or `<body>` for the dark theme. Put it there rather than on an inner wrapper, because overlays render at the end of `<body>` by default and only inherit the theme from an ancestor of it.
- Components that animate import a stylesheet from the package, so your bundler must handle CSS imports from dependencies. Vite and SvelteKit do this by default.

## Choosing a component

Actions and navigation

- **Button** for actions. **ButtonLink** for navigation. Never navigate from a Button `onclick`.
- **Menu** for a list of actions or view options behind one trigger. Choosing a value for a form is Select, not Menu.
- **Toggle** for one option that stays pressed, such as "Live updates". **Toggle Group** for a toolbar set of pressed buttons.
- **Navigation Menu** for links to the main areas of a product. **Tabs** for views of the same object on one page. **Pagination** for long lists. **Steps** for a task split into ordered steps.

Choosing values

- **Select** for a short list people already understand, usually fewer than 15 options.
- **Combobox** for a long list, or one people search by typing.
- **Listbox** for a list shown inline instead of in a dropdown.
- **Radio Group** for two to about six options that need comparing, especially with descriptions.
- **Segment Group** for two to five short options that change a view or filter, such as a time range.
- **Checkbox** for an independent on/off answer in a form, and **CheckboxGroup** for choosing several options. **Switch** for a setting that applies immediately.
- **Tags Input** for free-form values. **Number Input** for a number. **Slider** when the position in a range matters more than the exact value.
- **Date Input** when people know the date and type it. **Date Picker** when they need a calendar or a range.
- **File Upload** for choosing or dropping files.

Layout and disclosure

- **Accordion** for card-style expandable sections. **Collapsible** for lightweight show and hide without card styling.
- **Field** to label a `FieldInput` or `FieldTextarea`. **Fieldset** to group related fields under one legend.
- **Scroll Area** for a region with long or wide content. **Tree View** for hierarchical data.

Feedback and overlays

- **Dialog** for a short task or decision that must be finished or dismissed first. Use `role="alertdialog"` to confirm destructive actions.
- **Drawer** for details people consult while staying on the page.
- **Popover** for brief or interactive content next to a control. **Tooltip** for a short, non-essential hint.
- **Toast** for brief feedback on the result of an action. Errors that block the current task belong inline or in a Dialog.
- **Progress Linear** and **Progress Circular** for known progress. Pass `value={null}` while it is unknown.
- **Tour** sparingly, for a new or changed interface. Every tour must be skippable.

## The shared form API

Form controls use the same props wherever they apply:

- `label` is required and names the control, even when `labelHidden` hides it visually.
- `helperText` describes the expected value. `error` explains what went wrong; a non-empty `error` marks the control invalid. `invalid` sets the invalid state without a message.
- `required`, `disabled`, `readOnly`, `name` and `id` behave like their native counterparts. Inside a disabled Fieldset, check the component's contract before relying on the Fieldset to disable it; pass `disabled` when in doubt.
- Bind the value with `bind:`. Its shape depends on the component:
  - `string[]`: Select, Combobox, Listbox, CheckboxGroup, Tags Input. Single-select reads `value[0]`.
  - `boolean`: Checkbox (`checked`), Switch (`checked`), Toggle (`pressed`).
  - `string | null`: Radio Group, Segment Group.
  - `string`: Number Input. Its `onValueChange` also gives `valueAsNumber`.
  - `number[]`: Slider. Two values make a range.
  - Dates: Date Input binds one `DateValue`, and Date Picker binds `DateValue[]`. Create them with `parseDate` from each component's entry point.
  - `File[]`: File Upload (`files`).
- Only `FieldInput` and `FieldTextarea` go inside a `Field`. Every other control renders its own label and messages, so wrapping it in `Field` adds a second label.
- File Upload has no `helperText`. Put limits and guidance in `dropzoneHint`, which is announced with the dropzone.

## Overlays

- Combobox, Select, Date Picker, Menu, Popover, Tooltip, Dialog and Drawer render their panel at the end of `<body>` by default. Pass `portalled={false}` only when the panel must stay inside a container.
- The `trigger` snippet receives props. Spread them onto one focusable element, normally a Button: `{#snippet trigger(props)}<Button {...props}>Open</Button>{/snippet}`.
- Dialog footer buttons do not close the dialog. Set `open` to `false` when the action is done. Dialog and Drawer content unmounts on close, so keep state that must survive in your own component.
- Mount one `Toaster` per placement. Two toasters with the same `placement` render duplicate ids, and the second one's toasts do not appear. A toast with an `action` stays until it is used or closed.

## Common mistakes

- An icon-only Button or Toggle with no `aria-label`. Icons are hidden from screen readers, so the control has no name. A Tooltip does not add one.
- Expecting `isLoading` to disable a Button. Pass `disabled` as well to prevent repeat submissions.
- Recoloring a component with `class`. `class` is for layout and spacing; use `colorScheme`, `type` or the component's own props for color.
- Putting the only explanation of an action, or an error, in a Tooltip or a Toast. Show it as visible text.
- Attaching a Tooltip to a disabled button. Disabled buttons get no hover or focus, so explain the reason in visible text instead.
- Showing meaning by color, icon or check mark alone. Labels, titles and error text must say it.
- Forgetting `type="submit"` on a Button that submits a form. Buttons default to `type="button"`.
- Using the same `value` twice in `items`. Options are keyed by value.

## Contracts

Each contract lists every rule for its component: inputs, behavior, display, accessibility and test hooks, with rule IDs such as `IN-1` that reviews cite. It also records known gaps and open decisions. Read the contract before using a component in a new way.

| Component                         | Entry point              | Contract                                                                   |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| Accordion, AccordionGroup         | `io-ark/accordion`       | [accordion.contract.md](accordion/accordion.contract.md)                   |
| Button, ButtonLink                | `io-ark/button`          | [button.contract.md](button/button.contract.md)                            |
| Checkbox, CheckboxGroup           | `io-ark/checkbox`        | [checkbox.contract.md](checkbox/checkbox.contract.md)                      |
| Collapsible                       | `io-ark/collapsible`     | [collapsible.contract.md](collapsible/collapsible.contract.md)             |
| Combobox                          | `io-ark/combobox`        | [combobox.contract.md](combobox/combobox.contract.md)                      |
| DateInput                         | `io-ark/date-input`      | [date-input.contract.md](date-input/date-input.contract.md)                |
| DatePicker                        | `io-ark/date-picker`     | [date-picker.contract.md](date-picker/date-picker.contract.md)             |
| Dialog                            | `io-ark/dialog`          | [dialog.contract.md](dialog/dialog.contract.md)                            |
| Drawer                            | `io-ark/drawer`          | [drawer.contract.md](drawer/drawer.contract.md)                            |
| Field, FieldInput, FieldTextarea  | `io-ark/field`           | [field.contract.md](field/field.contract.md)                               |
| Fieldset                          | `io-ark/fieldset`        | [fieldset.contract.md](fieldset/fieldset.contract.md)                      |
| FileUpload                        | `io-ark/file-upload`     | [file-upload.contract.md](file-upload/file-upload.contract.md)             |
| Listbox                           | `io-ark/listbox`         | [listbox.contract.md](listbox/listbox.contract.md)                         |
| Menu                              | `io-ark/menu`            | [menu.contract.md](menu/menu.contract.md)                                  |
| NavigationMenu                    | `io-ark/navigation-menu` | [navigation-menu.contract.md](navigation-menu/navigation-menu.contract.md) |
| NumberInput                       | `io-ark/number-input`    | [number-input.contract.md](number-input/number-input.contract.md)          |
| Pagination                        | `io-ark/pagination`      | [pagination.contract.md](pagination/pagination.contract.md)                |
| Popover                           | `io-ark/popover`         | [popover.contract.md](popover/popover.contract.md)                         |
| ProgressCircular                  | `io-ark/progress`        | [progress-circular.contract.md](progress/progress-circular.contract.md)    |
| ProgressLinear                    | `io-ark/progress`        | [progress-linear.contract.md](progress/progress-linear.contract.md)        |
| RadioGroup, RadioGroupItem        | `io-ark/radio-group`     | [radio-group.contract.md](radio-group/radio-group.contract.md)             |
| ScrollArea                        | `io-ark/scroll-area`     | [scroll-area.contract.md](scroll-area/scroll-area.contract.md)             |
| SegmentGroup                      | `io-ark/segment-group`   | [segment-group.contract.md](segment-group/segment-group.contract.md)       |
| Select                            | `io-ark/select`          | [select.contract.md](select/select.contract.md)                            |
| Slider                            | `io-ark/slider`          | [slider.contract.md](slider/slider.contract.md)                            |
| Steps                             | `io-ark/steps`           | [steps.contract.md](steps/steps.contract.md)                               |
| Switch                            | `io-ark/switch`          | [switch.contract.md](switch/switch.contract.md)                            |
| Tabs, TabsContent                 | `io-ark/tabs`            | [tabs.contract.md](tabs/tabs.contract.md)                                  |
| TagsInput                         | `io-ark/tags-input`      | [tags-input.contract.md](tags-input/tags-input.contract.md)                |
| Toaster, createIoToaster, toaster | `io-ark/toast`           | [toast.contract.md](toast/toast.contract.md)                               |
| Toggle                            | `io-ark/toggle`          | [toggle.contract.md](toggle/toggle.contract.md)                            |
| ToggleGroup                       | `io-ark/toggle-group`    | [toggle-group.contract.md](toggle-group/toggle-group.contract.md)          |
| Tooltip                           | `io-ark/tooltip`         | [tooltip.contract.md](tooltip/tooltip.contract.md)                         |
| Tour                              | `io-ark/tour`            | [tour.contract.md](tour/tour.contract.md)                                  |
| TreeView                          | `io-ark/tree-view`       | [tree-view.contract.md](tree-view/tree-view.contract.md)                   |

Entry points are relative to `@temporalio/ui`; for example `io-ark/button` is `@temporalio/ui/io-ark/button`.
