import { isString } from './is';
export const isValidSearchType = (parameter) => {
    if (!isString(parameter))
        return false;
    if (parameter === 'basic')
        return true;
    if (parameter === 'advanced')
        return true;
    return false;
};
export const getSearchType = (url) => {
    const searchType = url.searchParams.get('search');
    if (isValidSearchType(searchType))
        return searchType;
    url.searchParams.set('search', 'basic');
    return 'basic';
};
