import type { IconComponent } from '$lib/io/icon';

// A palette is a Raycast-style command menu. It renders whatever tool sets it
// is given, so dev tools and user tools share one UI.
//
// A tool contributes items to the root list. An item runs an action or pushes
// a view, and a view is another filterable list of items.

export type PaletteTone =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning'
  | 'brand'
  | 'information'
  | 'accent'
  | 'error';

export type PaletteVariant = 'default' | 'dev';

export type PaletteStatusVariant = 'success' | 'error' | 'info' | 'warning';

export interface PaletteContext {
  // Show a view on top of the current one. Esc returns to the previous view.
  push: (view: PaletteView) => void;
  pop: () => void;
  close: () => void;
  // Shows a message in the palette footer while it is open, or as a toast
  // once it has closed.
  toast: (
    message: string,
    variant?: PaletteStatusVariant,
    link?: string,
  ) => void;
  // Namespace from the current route, if the user is on a namespace page.
  namespace: () => string | undefined;
  // What the current page shows, if it shows a namespace or a workflow.
  subject: () => PaletteSubject | undefined;
}

export interface PaletteNamespaceSubject {
  kind: 'namespace';
  namespace: string;
}

export interface PaletteWorkflowSubject {
  kind: 'workflow';
  namespace: string;
  workflowId: string;
  runId?: string;
}

export type PaletteSubject = PaletteNamespaceSubject | PaletteWorkflowSubject;

export interface PaletteAction {
  title: string;
  run: (ctx: PaletteContext) => void | Promise<void>;
  // When set, the palette asks for a second Enter or click before it runs.
  confirm?: string;
  destructive?: boolean;
  // Shows the action but blocks it, with this text as the reason.
  disabled?: string;
}

export interface PaletteAccessory {
  label: string;
  tone?: PaletteTone;
}

export interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  // Defaults to the tool's icon.
  icon?: IconComponent;
  // Extra words that match the search but are not shown.
  keywords?: string[];
  accessory?: PaletteAccessory;
  // Shows the item but blocks its actions, with this text as the reason.
  disabled?: string;
  rules?: PaletteRules;
  // Enter runs the first action, Mod+Enter runs the second, and Mod+K lists
  // all of them.
  actions: PaletteAction[];
}

export interface PaletteView {
  id: string;
  title: string;
  placeholder?: string;
  // Read inside a reactive scope, so items can come from runes or stores.
  items: () => PaletteItem[];
  // Items built from the query, such as a typed value. They show above the
  // filtered items and are not filtered.
  search?: (query: string) => PaletteItem[];
  loading?: () => boolean;
  error?: () => string | null | undefined;
  emptyText?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

// `local` is the Vite dev server.
export type PaletteEnv = 'local' | 'staging' | 'production';

// What the rules are checked against. The app that mounts the palette
// supplies them. User facts are missing until the user loads.
export interface PaletteFacts {
  env: PaletteEnv;
  // Feature flags that are on.
  flags?: ReadonlySet<string>;
  // Checks a permission the way the app checks it elsewhere.
  can?: (permission: string) => boolean;
}

// Decides whether a tool set, tool or item renders. Every rule that is set
// must match, and a rule that is not set allows everything. Rules only hide
// tools. The API still enforces permissions.
export interface PaletteRules {
  env?: PaletteEnv[];
  // Every one of these flags is on.
  flags?: string[];
  // Every one of these permissions is allowed.
  permissions?: string[];
}

export interface PaletteTool {
  id: string;
  // Heading for this tool's items in the root list.
  section: string;
  // The icon for items that do not set their own.
  icon?: IconComponent;
  // Lower sorts first. Defaults to 100.
  order?: number;
  rules?: PaletteRules;
  // `page` tools act on what the current page shows. Their items go first,
  // under "On this page".
  placement?: 'page';
  items: (ctx: PaletteContext) => PaletteItem[];
  // Items built from the query itself, such as "Open workflow <id>" for a
  // pasted ID. They show above the filtered results and are not filtered.
  search?: (query: string, ctx: PaletteContext) => PaletteItem[];
  // Fallback query items, such as a docs search, show after the results.
  fallback?: boolean;
}

// A named group of tools, such as the dev tools. A palette merges every set it
// is given, so a developer sees the user tools and the dev tools together.
// Sets with the `dev` variant are tagged as dev tools so they are never
// mistaken for user-facing tools.
export interface PaletteToolSet {
  id: string;
  label: string;
  // One lowercase letter. Typing it and a space on an empty query scopes the
  // palette to this set. Keys must be unique across sets.
  key: string;
  // Lower sorts first. Defaults to 100.
  order?: number;
  variant?: PaletteVariant;
  rules?: PaletteRules;
  tools: PaletteTool[];
}
