declare type FilterKey = 'workflowId' | 'workflowType' | 'timeRange' | 'executionStatus' | 'closeTime';
export declare const isFilterKey: (key: unknown) => key is FilterKey;
export declare const toListWorkflowQuery: (parameters: FilterParameters | ArchiveFilterParameters, archived?: boolean) => string;
export {};
