export type TrackingOptions =
  | false
  | {
      name?: string;
      intent?: string;
      text?: string;
    };

export interface TrackingAttributes {
  'data-track-name'?: string;
  'data-track-intent'?: string;
  'data-track-text'?: string;
}

export function getTrackingAttributes(
  tracking: TrackingOptions | undefined,
  defaultIntent: string,
): TrackingAttributes {
  if (tracking === false) return {};

  return {
    'data-track-name': tracking?.name ?? 'button',
    'data-track-intent': tracking?.intent ?? defaultIntent,
    'data-track-text': tracking?.text ?? '*textContent*',
  };
}
