import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        events: WorkflowEvents;
        eventGroups: EventGroups;
        isRunning: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type EventHistoryGroupTimelineProps = typeof __propDef.props;
export declare type EventHistoryGroupTimelineEvents = typeof __propDef.events;
export declare type EventHistoryGroupTimelineSlots = typeof __propDef.slots;
export default class EventHistoryGroupTimeline extends SvelteComponentTyped<EventHistoryGroupTimelineProps, EventHistoryGroupTimelineEvents, EventHistoryGroupTimelineSlots> {
}
export {};
