import { SvelteComponentTyped } from "svelte";
import type { GetPollersResponse } from '../../services/pollers-service';
declare const __propDef: {
    props: {
        taskQueue: string;
        workers: GetPollersResponse;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type WorkersListProps = typeof __propDef.props;
export declare type WorkersListEvents = typeof __propDef.events;
export declare type WorkersListSlots = typeof __propDef.slots;
export default class WorkersList extends SvelteComponentTyped<WorkersListProps, WorkersListEvents, WorkersListSlots> {
}
export {};
