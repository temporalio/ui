import type { Component, ComponentProps } from 'svelte';

import type IconSvgWrapper from './icon-svg-wrapper.svelte';

export type IconProps = Omit<ComponentProps<typeof IconSvgWrapper>, 'children'>;

export type IconComponent = Component<IconProps>;
