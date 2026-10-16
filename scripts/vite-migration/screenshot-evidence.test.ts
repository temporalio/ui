import { describe, expect, it } from 'vitest';

import {
  compareScreenshotEvidence,
  screenshotMaxChannelDelta,
} from './screenshot-evidence';

const evidence = (channels: number[]) => ({
  path: 'page.jpg',
  sha256: channels.join('-'),
  sample: {
    width: 10,
    height: 10,
    rgbBase64: Buffer.from(channels).toString('base64'),
  },
});

describe('screenshot evidence', () => {
  it('matches identical screenshots', () => {
    const screenshot = evidence(new Array<number>(300).fill(128));

    expect(compareScreenshotEvidence(screenshot, screenshot)).toMatchObject({
      rawSha256Matches: true,
      normalizedMatches: true,
      differingChannels: 0,
      maxChannelDelta: 0,
    });
  });

  it('normalizes isolated Chromium anti-alias noise', () => {
    const baseline = new Array<number>(3000).fill(128);
    const candidate = [...baseline];
    candidate[100] += screenshotMaxChannelDelta;

    expect(
      compareScreenshotEvidence(evidence(baseline), evidence(candidate)),
    ).toMatchObject({
      rawSha256Matches: false,
      normalizedMatches: true,
      differingChannels: 1,
      maxChannelDelta: screenshotMaxChannelDelta,
    });
  });

  it('rejects channel differences above the anti-alias threshold', () => {
    const baseline = new Array<number>(3000).fill(128);
    const candidate = [...baseline];
    candidate[100] += screenshotMaxChannelDelta + 1;

    expect(
      compareScreenshotEvidence(evidence(baseline), evidence(candidate)),
    ).toMatchObject({
      normalizedMatches: false,
      differingChannels: 1,
      maxChannelDelta: screenshotMaxChannelDelta + 1,
    });
  });

  it('rejects broad low-amplitude differences', () => {
    const baseline = new Array<number>(3000).fill(128);
    const candidate = [...baseline];
    candidate[100] += 1;
    candidate[200] += 1;
    candidate[300] += 1;
    candidate[400] += 1;

    expect(
      compareScreenshotEvidence(evidence(baseline), evidence(candidate)),
    ).toMatchObject({
      normalizedMatches: false,
      differingChannels: 4,
      maxChannelDelta: 1,
    });
  });
});
