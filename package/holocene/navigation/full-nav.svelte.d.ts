import { SvelteComponentTyped } from "svelte";
export interface ExtraIcon {
    component: typeof SvelteComponent;
    name: string;
}
import type { SvelteComponent } from 'svelte';
import type { DescribeNamespaceResponse as Namespace } from '$types';
declare const __propDef: {
    props: {
        isCloud?: boolean;
        activeNamespace: Namespace;
        getNamespaceList: () => Promise<NamespaceItem[]>;
        linkList: Partial<Record<string, string>>;
        user: Promise<User> | undefined;
        logout: () => void;
        extras?: ExtraIcon[] | null;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        usage: {};
        feedback: {};
        settings: {};
    };
};
export declare type FullNavProps = typeof __propDef.props;
export declare type FullNavEvents = typeof __propDef.events;
export declare type FullNavSlots = typeof __propDef.slots;
export default class FullNav extends SvelteComponentTyped<FullNavProps, FullNavEvents, FullNavSlots> {
}
export {};
