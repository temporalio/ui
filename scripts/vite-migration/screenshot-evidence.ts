export const screenshotSampleWidth = 180;
export const screenshotMaxChannelDelta = 2;
export const screenshotMaxDifferingChannelRatio = 0.001;

export type ScreenshotSample = {
  width: number;
  height: number;
  rgbBase64: string;
};

export type ScreenshotEvidence = {
  path: string;
  sha256: string;
  sample: ScreenshotSample;
};

export type ScreenshotComparison = {
  rawSha256Matches: boolean;
  normalizedMatches: boolean;
  differingChannels: number;
  totalChannels: number;
  differingChannelRatio: number;
  maxChannelDelta: number;
  allowedMaxChannelDelta: number;
  allowedDifferingChannelRatio: number;
};

export const compareScreenshotEvidence = (
  baseline: ScreenshotEvidence,
  candidate: ScreenshotEvidence,
): ScreenshotComparison => {
  const baselineRgb = Buffer.from(baseline.sample.rgbBase64, 'base64');
  const candidateRgb = Buffer.from(candidate.sample.rgbBase64, 'base64');
  const dimensionsMatch =
    baseline.sample.width === candidate.sample.width &&
    baseline.sample.height === candidate.sample.height;
  const lengthsMatch = baselineRgb.length === candidateRgb.length;
  const totalChannels = Math.max(baselineRgb.length, candidateRgb.length);
  let differingChannels = 0;
  let maxChannelDelta = 0;

  if (dimensionsMatch && lengthsMatch) {
    for (let index = 0; index < baselineRgb.length; index += 1) {
      const channelDelta = Math.abs(baselineRgb[index] - candidateRgb[index]);
      if (channelDelta > 0) differingChannels += 1;
      if (channelDelta > maxChannelDelta) maxChannelDelta = channelDelta;
    }
  } else {
    differingChannels = totalChannels;
    maxChannelDelta = 255;
  }

  const differingChannelRatio =
    totalChannels === 0 ? 0 : differingChannels / totalChannels;

  return {
    rawSha256Matches: baseline.sha256 === candidate.sha256,
    normalizedMatches:
      dimensionsMatch &&
      lengthsMatch &&
      maxChannelDelta <= screenshotMaxChannelDelta &&
      differingChannelRatio <= screenshotMaxDifferingChannelRatio,
    differingChannels,
    totalChannels,
    differingChannelRatio,
    maxChannelDelta,
    allowedMaxChannelDelta: screenshotMaxChannelDelta,
    allowedDifferingChannelRatio: screenshotMaxDifferingChannelRatio,
  };
};
