import type {
  PaletteItem,
  PaletteView,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';

export interface Choice<T> {
  id: string;
  label: string;
  value: T;
  subtitle?: string;
}

interface ChoiceViewOptions<T> {
  id: string;
  title: string;
  placeholder: string;
  choices: () => Choice<T>[];
  current: () => T;
  pick: (value: T) => void;
}

// A view that sets one preference. The current choice is marked.
export function choiceView<T>({
  id,
  title,
  placeholder,
  choices,
  current,
  pick,
}: ChoiceViewOptions<T>): PaletteView {
  return {
    id,
    title,
    placeholder,
    items: () =>
      choices().map(
        (choice): PaletteItem => ({
          id: choice.id,
          title: choice.label,
          subtitle: choice.subtitle,
          accessory:
            choice.value === current()
              ? {
                  label: translate('palette-preferences.current'),
                  tone: 'success',
                }
              : undefined,
          actions: [
            {
              title: translate('palette-preferences.choose'),
              run: (ctx) => {
                pick(choice.value);
                ctx.pop();
              },
            },
          ],
        }),
      ),
  };
}

// The label of the current choice, for an item's accessory.
export function currentLabel<T>(choices: Choice<T>[], value: T): string {
  return (
    choices.find((choice) => choice.value === value)?.label ?? String(value)
  );
}
