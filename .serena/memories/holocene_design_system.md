# Holocene Design System

## Overview

Holocene is Temporal UI's custom design system built with Svelte 5 and TailwindCSS. It provides a consistent set of components following Temporal's design language.

## Core Components

### Layout Components

- **Card**: Content container with optional header/footer
- **Panel**: Side panel for additional content
- **Modal**: Overlay dialogs
- **Accordion**: Collapsible content sections
- **Tabs**: Tabbed navigation
- **VerticalNav**: Vertical navigation with animated backgrounds

### Form Components

- **Input**: Text input with validation
- **Select**: Dropdown selection
- **Checkbox**: Boolean selection
- **Radio**: Single choice selection
- **Toggle**: On/off switch
- **DatePicker**: Date selection
- **Combobox**: Searchable dropdown

### Data Display

- **Table**: Data tables with sorting/filtering
- **DataTable**: Advanced table with pagination
- **CodeBlock**: Syntax-highlighted code display
- **Badge**: Status indicators
- **Chip**: Tag/label display
- **EmptyState**: No data states

### Navigation

- **Button**: Primary interactive element
- **Link**: Navigation links
- **Breadcrumb**: Navigation hierarchy
- **Pagination**: Page navigation
- **TabList/TabPanel**: Tab navigation

### Feedback

- **Alert**: Information messages
- **Toast**: Temporary notifications
- **Loading**: Loading indicators
- **Skeleton**: Content placeholders
- **Tooltip**: Contextual help

## Component Structure

```typescript
// Standard component pattern
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLElement> {
    variant?: 'primary' | 'secondary';
    class?: string;
  }

  let {
    variant = 'primary',
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div class={merge('base-styles', variantStyles[variant], className)} {...restProps}>
  <!-- content -->
</div>
```

## Design Tokens

- Colors: Uses Tailwind color palette
- Spacing: 4px base unit (0.5, 1, 2, 4, 8, etc.)
- Typography: System font stack
- Shadows: Tailwind shadow utilities
- Borders: 1px default, rounded corners

## Best Practices

1. Always use Holocene components when available
2. Follow existing component patterns
3. Use TailwindCSS utilities for styling
4. Maintain consistent spacing
5. Ensure keyboard accessibility
6. Include ARIA attributes
7. Support dark/light themes
8. Test in Storybook

## Creating New Components

1. Place in `src/lib/holocene/component-name/`
2. Export from `index.svelte`
3. Add Storybook story
4. Follow naming conventions
5. Include TypeScript types
6. Support standard HTML attributes
7. Use `twMerge` for class merging

## Common Utilities

- `twMerge`: Merge Tailwind classes
- `formatDate`: Date formatting
- `translate`: i18n translations
- `getContext/setContext`: Component communication
- `createEventDispatcher`: Custom events
