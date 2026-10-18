// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=1161-1978
// source=src/lib/io/chip/chip.svelte
// component=Chip
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
});
const disabled = instance.getEnum('state', {
  Default: false,
  Hover: false,
  Focus: false,
  Press: false,
  Disabled: true,
});
const Icon = swapIcon('showIcon', 'swapIcon');

const extensionText = instance.getBoolean('showExtension')
  ? instance.getString('extensionText')
  : undefined;
const ExtensionIcon = extensionText
  ? swapIcon('showExtensionIcon', 'swapExtensionIcon')
  : undefined;

export default {
  example: figma.code`<Chip text="${text}" colorScheme="${colorScheme}"${
    Icon ? figma.code` Icon={${Icon}}` : ''
  }${
    extensionText
      ? figma.code` extension={{ text: '${extensionText}'${
          ExtensionIcon ? figma.code`, Icon: ${ExtensionIcon}` : ''
        } }}`
      : ''
  }${disabled ? ' disabled' : ''} />`,
  imports: [
    "import { Chip } from '$lib/io/chip';",
    ...iconImport([Icon, ExtensionIcon]),
  ],
  id: 'chip',
  metadata: { nestable: true },
};
