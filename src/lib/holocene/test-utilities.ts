import type { Story } from '@storybook/addon-svelte-csf';
import { expect, within } from '@storybook/test';

type PlayFunction = Story['$$prop_def']['play'];
type PlayFunctionContext = Parameters<NonNullable<PlayFunction>>[0];

export const shouldNotBeTransparent = (
  fn: (canvas: ReturnType<typeof within>) => PlayFunction,
) => {
  return ({ canvasElement }: PlayFunctionContext) => {
    const canvas = within(canvasElement);
    const element = fn(canvas);
    expect(element).not.toHaveStyle({ backgroundColor: 'rgba(0,0,0,0)' });
  };
};
