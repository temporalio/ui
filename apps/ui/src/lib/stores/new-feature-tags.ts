import { get } from 'svelte/store';

import { persistStore } from './persist-store';

export const viewedFeatureTags = persistStore('viewedFeatureTags', null);

export const viewFeature = (feature: string): void => {
  let featureTags: string[] = get(viewedFeatureTags) ?? [];
  if (!featureTags.includes(feature)) {
    featureTags = [...featureTags, feature];
    viewedFeatureTags.set(featureTags);
  }
};
