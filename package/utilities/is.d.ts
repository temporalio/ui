import type { EventSortOrder } from '../../stores/event-view';
declare type Quote = "'" | '"';
export declare const isString: (x: unknown) => x is string;
export declare const isNull: (x: unknown) => x is null;
export declare const isObject: (x: unknown) => x is {
    unknown: unknown;
};
export declare const isNumber: (x: unknown) => x is number;
export declare const isExecutionStatus: (x: unknown) => x is WorkflowExecutionStatus;
export declare const isSpace: (x: unknown) => x is " ";
export declare const isQuote: (x: unknown) => x is Quote;
export declare const isOperator: (x: unknown) => x is "=" | ">" | "<" | "!" | ">=" | "<=" | "==" | "!=" | "===" | "!==" | "and" | "or" | "between" | "order by" | "in" | "(" | ")";
export declare const isSortOrder: (sortOrder: string | EventSortOrder) => sortOrder is EventSortOrder;
export {};
