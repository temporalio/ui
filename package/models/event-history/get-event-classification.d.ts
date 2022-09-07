export declare type EventClassification = typeof eventClassifications[number];
export declare const eventClassifications: readonly ["Unspecified", "Scheduled", "Open", "New", "Started", "Initiated", "Running", "Completed", "Fired", "CancelRequested", "TimedOut", "Signaled", "Canceled", "Failed", "Terminated"];
export declare const getEventClassification: (eventType: EventType) => EventClassification;
