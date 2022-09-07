declare type SearchType = 'basic' | 'advanced';
export declare const isValidSearchType: (parameter: unknown) => parameter is SearchType;
export declare const getSearchType: (url: URL) => SearchType;
export {};
