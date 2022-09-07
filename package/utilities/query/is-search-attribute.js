import { get } from 'svelte/store';
import { searchAttributes } from '../../stores/search-attributes';
import { isString } from '../is';
export const isSearchAttribute = (attribute, attributes = searchAttributes) => {
    if (!isString(attribute))
        return false;
    return !!get(attributes)[attribute];
};
