import { get } from 'svelte/store';
import { persistStore } from './persist-store';
export const viewedFeatureTags = persistStore('viewedFeatureTags', null);
export const viewFeature = (feature) => {
    var _a;
    let featureTags = (_a = get(viewedFeatureTags)) !== null && _a !== void 0 ? _a : [];
    if (!featureTags.includes(feature)) {
        featureTags = [...featureTags, feature];
        viewedFeatureTags.set(featureTags);
    }
};
