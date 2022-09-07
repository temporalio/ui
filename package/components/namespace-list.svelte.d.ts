import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        getNamespaceList?: () => Promise<NamespaceItem[]>;
        rootDocumentHandler?: (node: Element) => {
            destroy: () => void;
        };
    };
    events: {
        closeNamespaceList: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type NamespaceListProps = typeof __propDef.props;
export declare type NamespaceListEvents = typeof __propDef.events;
export declare type NamespaceListSlots = typeof __propDef.slots;
export default class NamespaceList extends SvelteComponentTyped<NamespaceListProps, NamespaceListEvents, NamespaceListSlots> {
    get rootDocumentHandler(): (node: Element) => {
        destroy: () => void;
    };
}
export {};
