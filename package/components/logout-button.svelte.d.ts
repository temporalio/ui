import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        user: User;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type LogoutButtonProps = typeof __propDef.props;
export declare type LogoutButtonEvents = typeof __propDef.events;
export declare type LogoutButtonSlots = typeof __propDef.slots;
export default class LogoutButton extends SvelteComponentTyped<LogoutButtonProps, LogoutButtonEvents, LogoutButtonSlots> {
}
export {};
