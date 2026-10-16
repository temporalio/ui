// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=4218-76078
// source=src/lib/io/badge/badge.svelte
// component=Badge
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

const instance = figma.selectedInstance;

const iconName = (icon: ReturnType<typeof instance.getInstanceSwap>) =>
  icon && icon.type === 'INSTANCE'
    ? (icon.executeTemplate().metadata?.props?.componentName as
        | string
        | undefined)
    : undefined;

const swapIcon = (show: string, swap: string) =>
  instance.getBoolean(show)
    ? iconName(instance.getInstanceSwap(swap))
    : undefined;

const iconImport = (names: (string | undefined)[]) => {
  const unique = [...new Set(names.filter(Boolean))];
  return unique.length
    ? [`import { ${unique.join(', ')} } from '$lib/io/icon';`]
    : [];
};

const text = instance.getString('text');
const colorScheme = instance.getEnum('colorScheme', {
  neutral: 'neutral',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  error: 'error',
  accent: 'accent',
});
const Icon = swapIcon('showIcon', 'swapIcon');

export default {
  example: figma.code`<Badge text="${text}" colorScheme="${colorScheme}"${
    Icon ? figma.code` Icon={${Icon}}` : ''
  } />`,
  imports: ["import { Badge } from '$lib/io/badge';", ...iconImport([Icon])],
  id: 'badge',
  metadata: { nestable: true },
};
