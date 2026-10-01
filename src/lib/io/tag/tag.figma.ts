// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2959-84741
// source=src/lib/io/tag/tag.svelte
// component=Tag
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
  accent: 'accent',
});
const showIcon = instance.getBoolean('showIcon');
const Icon = swapIcon('showIcon', 'swapIcon');
const iconProp = !showIcon
  ? 'false'
  : Icon && Icon !== 'IconTag'
    ? Icon
    : undefined;

const extensionText = instance.getBoolean('showExtension')
  ? instance.getString('extensionText')
  : undefined;
const ExtensionIcon = extensionText
  ? swapIcon('showExtensionIcon', 'swapExtensionIcon')
  : undefined;

export default {
  example: figma.code`<Tag text="${text}" colorScheme="${colorScheme}"${
    iconProp ? figma.code` Icon={${iconProp}}` : ''
  }${
    extensionText
      ? figma.code` extension={{ text: '${extensionText}'${
          ExtensionIcon ? figma.code`, Icon: ${ExtensionIcon}` : ''
        } }}`
      : ''
  } />`,
  imports: [
    "import { Tag } from '$lib/io/tag';",
    ...iconImport([iconProp === 'false' ? undefined : iconProp, ExtensionIcon]),
  ],
  id: 'tag',
  metadata: { nestable: true },
};
