import { SvelteComponentTyped } from "svelte";
declare class __sveltets_Render<T> {
    props(): {
        key?: string;
        items: T[];
        floatId?: string;
        updating?: boolean;
        startingIndex?: string | number;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {
        action: {};
        default: {
            visibleItems: T[];
            initialItem: T;
        };
    };
}
export declare type PaginationProps<T> = ReturnType<__sveltets_Render<T>['props']>;
export declare type PaginationEvents<T> = ReturnType<__sveltets_Render<T>['events']>;
export declare type PaginationSlots<T> = ReturnType<__sveltets_Render<T>['slots']>;
export default class Pagination<T> extends SvelteComponentTyped<PaginationProps<T>, PaginationEvents<T>, PaginationSlots<T>> {
}
export {};
