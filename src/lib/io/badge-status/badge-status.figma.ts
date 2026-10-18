// url=https://www.figma.com/design/P2066CgoBe2noGhNJ8yBn8/IO-Design-System?node-id=2682-121218
// source=src/lib/io/badge-status/badge-status.svelte
// component=BadgeStatus
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

const variant = instance.getEnum('status', {
  Running: { status: 'Running' },
  Paused: { status: 'Paused' },
  Completed: { status: 'Completed' },
  ContinuedAsNew: { status: 'ContinuedAsNew' },
  Failed: { status: 'Failed' },
  TimedOut: { status: 'TimedOut' },
  Terminated: { status: 'Terminated' },
  Canceled: { status: 'Canceled' },
  'Running + Task Fail': { status: 'Running', colorScheme: 'danger' },
  'Running + Delayed': { status: 'Running', colorScheme: 'warning' },
  'Running + Paused': { status: 'Running', colorScheme: 'warning' },
  'Running + Timeskip': { status: 'Running', colorScheme: 'neutral' },
}) as { status: string; colorScheme?: string };

const TrailIcon = swapIcon('showTrailIcon', 'swapTrailIcon');

const layerIcon = (layer: string) => {
  const icon = instance.findInstance(layer);
  return icon && icon.type === 'INSTANCE' ? iconName(icon) : undefined;
};

const hasExtension =
  Boolean(variant.colorScheme) || instance.getBoolean('showExtension');
const extensionTextLayer = instance.findText('Extension Text');
const extensionText =
  hasExtension &&
  extensionTextLayer.type === 'TEXT' &&
  instance.getBoolean('showExtensionText')
    ? instance.getString('extensionText')
    : undefined;
const ExtensionLeadIcon =
  hasExtension && instance.getBoolean('showExtensionLeadIcon')
    ? layerIcon('Ext Lead Icon')
    : undefined;
const ExtensionTrailIcon =
  hasExtension && instance.getBoolean('showExtensionTrailIcon')
    ? layerIcon('Ext Trail Icon')
    : undefined;

const extensionFields = [
  extensionText ? figma.code`text: '${extensionText}'` : undefined,
  variant.colorScheme
    ? figma.code`colorScheme: '${variant.colorScheme}'`
    : undefined,
  ExtensionLeadIcon ? figma.code`LeadIcon: ${ExtensionLeadIcon}` : undefined,
  ExtensionTrailIcon ? figma.code`TrailIcon: ${ExtensionTrailIcon}` : undefined,
].filter(Boolean);

const [f1, f2, f3, f4] = extensionFields;
const fields = figma.code`${f1 ?? ''}${f2 ? figma.code`, ${f2}` : ''}${
  f3 ? figma.code`, ${f3}` : ''
}${f4 ? figma.code`, ${f4}` : ''}`;

export default {
  example: figma.code`<BadgeStatus status="${variant.status}"${
    TrailIcon ? figma.code` TrailIcon={${TrailIcon}}` : ''
  }${extensionFields.length ? figma.code` extensions={[{ ${fields} }]}` : ''} />`,
  imports: [
    "import { BadgeStatus } from '$lib/io/badge-status';",
    ...iconImport([TrailIcon, ExtensionLeadIcon, ExtensionTrailIcon]),
  ],
  id: 'badge-status',
  metadata: { nestable: true },
};
