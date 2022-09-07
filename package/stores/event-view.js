import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { persistStore } from './persist-store';
import { settings } from './settings';
import { temporalVersion } from './versions';
import { isVersionNewer } from '../utilities/version-check';
import { isSortOrder } from '../utilities/is';
export const eventViewType = persistStore('eventView', 'feed');
export const expandAllEvents = persistStore('expandAllEvents', 'false');
export const eventFilterSort = persistStore('eventFilterSort', 'descending');
export const eventShowElapsed = persistStore('eventShowElapsed', 'false');
export const eventCategoryParam = derived([page], ([$page]) => $page.url.searchParams.get('category'));
export const eventSortParam = derived([page], ([$page]) => {
    const sortParameter = $page.url.searchParams.get('sort');
    if (isSortOrder(sortParameter))
        return sortParameter;
    return 'descending';
});
export const supportsReverseOrder = derived([temporalVersion, settings], ([$temporalVersion, $settings]) => {
    if ($settings.runtimeEnvironment.isCloud)
        return true;
    return isVersionNewer($temporalVersion, '1.16.0');
});
export const eventSortOrder = derived([eventFilterSort, supportsReverseOrder, eventSortParam], ([$eventFilterSort, $supportsReverseOrder, $eventSortParam]) => {
    let sortOrder;
    if ($supportsReverseOrder) {
        if ($eventSortParam)
            return $eventSortParam;
        sortOrder = $eventFilterSort;
    }
    else {
        sortOrder = 'ascending';
    }
    return sortOrder;
});
