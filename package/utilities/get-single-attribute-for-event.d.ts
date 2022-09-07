declare type SummaryAttribute = {
    key: string;
    value: string | Record<string, unknown>;
};
export declare const shouldDisplayAsPlainText: (key: string) => boolean;
export declare const shouldDisplayAttribute: (key: string, value: unknown) => boolean;
export declare const shouldDisplayNestedAttribute: (value: unknown) => boolean;
export declare const getCodeBlockValue: Parameters<typeof JSON.stringify>[0];
export declare const shouldDisplayAsExecutionLink: (key: string) => key is "baseRunId" | "continuedExecutionRunId" | "firstExecutionRunId" | "newExecutionRunId" | "newRunId" | "originalExecutionRunId";
export declare const shouldDisplayAsTaskQueueLink: (key: string) => key is "taskQueueName";
export declare const getSummaryForEventGroup: ({ lastEvent, }: EventGroup) => SummaryAttribute;
export declare const getSingleAttributeForEvent: (event: WorkflowEvent | EventGroup) => SummaryAttribute;
export {};
