import { Readable } from 'svelte/store';
export declare type EventSortOrder = 'ascending' | 'descending';
export declare type EventSortOrderOptions = {
    label: string;
    option: EventSortOrder;
}[];
export declare const eventViewType: Pick<import("svelte/store").Writable<EventView>, "subscribe" | "set">;
export declare const expandAllEvents: Pick<import("svelte/store").Writable<string>, "subscribe" | "set">;
export declare const eventFilterSort: Pick<import("svelte/store").Writable<EventSortOrder>, "subscribe" | "set">;
export declare const eventShowElapsed: Pick<import("svelte/store").Writable<BooleanString>, "subscribe" | "set">;
export declare const eventCategoryParam: Readable<any>;
export declare const eventSortParam: Readable<EventSortOrder>;
export declare const supportsReverseOrder: Readable<boolean>;
export declare const eventSortOrder: Readable<EventSortOrder>;
