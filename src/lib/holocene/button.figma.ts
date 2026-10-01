// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=828-1671
// source=src/lib/holocene/button.svelte
// component=Button
/// <reference types="@figma/code-connect/figma-types-no-require" />
import figma from 'figma';

const instance = figma.selectedInstance;

const text = instance.getString('text');
const iconOnly = instance.getEnum('variant', {
  Default: false,
  Icon: true,
});
const variant = instance.getEnum('colorScheme', {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary',
  Ghost: 'ghost',
  Danger: 'destructive',
});
const size = instance.getEnum('size', {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
});
const disabled = instance.getEnum('state', {
  Default: false,
  Hover: false,
  Press: false,
  Focus: false,
  Disabled: true,
});

const iconName = (propName: string) => {
  const icon = instance.getInstanceSwap(propName);
  if (icon && icon.type === 'INSTANCE') {
    return icon.executeTemplate().metadata?.props?.componentName;
  }
  return undefined;
};

const leadingIcon = iconOnly
  ? iconName('swapIconOnly')
  : instance.getBoolean('showLeadIcon')
    ? iconName('swapLeadIcon')
    : undefined;
const trailingIcon =
  !iconOnly && instance.getBoolean('showTrailIcon')
    ? iconName('swapTrailIcon')
    : undefined;

let count: string | undefined;
if (!iconOnly && instance.getBoolean('showTrailElement')) {
  const badge = instance.findInstance('Trail element');
  if (badge && badge.type === 'INSTANCE') {
    count = badge.getString('value');
  }
}

const imports = ["import Button from '$lib/holocene/button.svelte';"];
const iconImports = [leadingIcon, trailingIcon].filter(Boolean);
if (iconImports.length) {
  imports.push(
    `import { ${[...new Set(iconImports)].join(', ')} } from '$lib/io/icon';`,
  );
}

export default {
  example: iconOnly
    ? figma.code`<Button
  variant="${variant}"
  size="${size}"${
    leadingIcon
      ? figma.code`
  LeadingIcon={${leadingIcon}}`
      : ''
  }
  aria-label="${text}"${
    disabled
      ? figma.code`
  disabled`
      : ''
  }
/>`
    : figma.code`<Button
  variant="${variant}"
  size="${size}"${
    leadingIcon
      ? figma.code`
  LeadingIcon={${leadingIcon}}`
      : ''
  }${
    trailingIcon
      ? figma.code`
  TrailingIcon={${trailingIcon}}`
      : ''
  }${
    count
      ? figma.code`
  count={${count}}`
      : ''
  }${
    disabled
      ? figma.code`
  disabled`
      : ''
  }
>
  ${text}
</Button>`,
  imports,
  id: 'button',
  metadata: { nestable: true },
};
