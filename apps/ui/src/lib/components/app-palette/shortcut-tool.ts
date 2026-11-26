import { translate } from '$lib/i18n/translate';
import { IconKeyboard } from '$lib/io/icon';

import { IS_MAC, recordShortcut, shortcutLabel } from './keys';
import type {
  PaletteAction,
  PaletteContext,
  PaletteItem,
  PaletteTool,
  PaletteView,
} from './types';

import { appPalette } from './app-palette-state.svelte';

// Reads the next key press as the new shortcut. Problems show in the footer,
// so the user can try again or press Esc.
function onRecordKeydown(event: KeyboardEvent, ctx: PaletteContext): boolean {
  if (event.key === 'Escape') return false;

  const result = recordShortcut(event);
  if (result.kind === 'waiting') return true;
  if (result.kind === 'needs-key') {
    ctx.toast(translate('palette.shortcut-needs-key'), 'warning');
    return true;
  }
  if (result.kind === 'needs-mod') {
    ctx.toast(
      translate(
        IS_MAC
          ? 'palette.shortcut-needs-mod-mac'
          : 'palette.shortcut-needs-mod',
      ),
      'warning',
    );
    return true;
  }
  if (result.kind === 'reserved') {
    ctx.toast(
      translate('palette.shortcut-reserved', { shortcut: result.label }),
      'warning',
    );
    return true;
  }

  appPalette.setUserShortcut(result.shortcut);
  ctx.pop();
  ctx.toast(
    translate('palette.shortcut-saved', {
      shortcut: shortcutLabel(result.shortcut),
    }),
    'success',
  );
  return true;
}

function recordView(): PaletteView {
  return {
    id: 'palette-shortcut-record',
    title: translate('palette.shortcut-change'),
    placeholder: translate('palette.shortcut-record-prompt'),
    items: () => [
      {
        id: 'palette-shortcut-record-hint',
        title: translate('palette.shortcut-record-prompt'),
        subtitle: translate(
          IS_MAC
            ? 'palette.shortcut-record-hint-mac'
            : 'palette.shortcut-record-hint',
        ),
        actions: [],
      },
    ],
    onKeydown: onRecordKeydown,
  };
}

function changeAction(): PaletteAction {
  return {
    title: translate('palette.shortcut-change'),
    run: (ctx) => ctx.push(recordView()),
  };
}

function turnOffAction(): PaletteAction {
  return {
    title: translate('palette.shortcut-turn-off'),
    run: (ctx) => {
      appPalette.setUserShortcut('off');
      ctx.toast(translate('palette.shortcut-turned-off'), 'success');
    },
  };
}

function turnOnAction(): PaletteAction {
  return {
    title: translate('palette.shortcut-turn-on'),
    run: (ctx) => {
      appPalette.setUserShortcut(undefined);
      ctx.toast(
        translate('palette.shortcut-saved', {
          shortcut: shortcutLabel(appPalette.appShortcut),
        }),
        'success',
      );
    },
  };
}

function resetAction(): PaletteAction {
  const shortcut = shortcutLabel(appPalette.appShortcut);
  return {
    title: translate('palette.shortcut-reset', { shortcut }),
    run: (ctx) => {
      appPalette.setUserShortcut(undefined);
      ctx.toast(translate('palette.shortcut-saved', { shortcut }), 'success');
    },
  };
}

function shortcutActions(): PaletteAction[] {
  if (appPalette.userShortcut === 'off') {
    return [turnOnAction(), changeAction()];
  }
  if (appPalette.userShortcut) {
    return [changeAction(), resetAction(), turnOffAction()];
  }
  return [changeAction(), turnOffAction()];
}

function shortcutItem(): PaletteItem {
  return {
    id: 'palette-shortcut',
    title: translate('palette.shortcut'),
    subtitle: translate('palette.shortcut-subtitle'),
    keywords: ['hotkey', 'keyboard', 'keybinding'],
    accessory: {
      label: appPalette.shortcutLabel ?? translate('palette.shortcut-off'),
    },
    actions: shortcutActions(),
  };
}

// Lets each user change the palette shortcut or turn it off, for example
// when it takes a key their browser uses. Add it to any tool set.
export const paletteShortcutTool: PaletteTool = {
  id: 'palette-shortcut',
  get section() {
    return translate('palette.shortcut-section');
  },
  icon: IconKeyboard,
  items: () => [shortcutItem()],
};
