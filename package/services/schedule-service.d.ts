import type { DescribeScheduleResponse, CreateScheduleRequest, UpdateScheduleRequest, ScheduleListEntry } from '$types';
declare type ScheduleParameters = {
    namespace: string;
    scheduleId: string;
};
export declare type ScheduleResponse = {
    schedules: ScheduleListEntry[];
    nextPageToken: string;
    error?: string;
};
export declare type FetchSchedule = typeof fetchAllSchedules;
export declare const fetchAllSchedules: (namespace: string, request?: typeof fetch) => Promise<ScheduleResponse>;
export declare function fetchSchedule(parameters: ScheduleParameters, request?: typeof fetch): Promise<DescribeScheduleResponse>;
export declare function deleteSchedule(parameters: ScheduleParameters, request?: typeof fetch): Promise<void>;
declare type CreateScheduleOptions = {
    namespace: string;
    body: CreateScheduleRequest;
};
export declare function createSchedule({ namespace, body, }: CreateScheduleOptions): Promise<{
    error: string;
    conflictToken: string;
}>;
declare type EditScheduleOptions = {
    namespace: string;
    scheduleId: string;
    request_id: string;
    body: UpdateScheduleRequest;
};
export declare function editSchedule({ namespace, scheduleId, body, }: EditScheduleOptions): Promise<null>;
declare type PauseScheduleOptions = {
    namespace: string;
    scheduleId: string;
    reason: string;
};
export declare function pauseSchedule({ namespace, scheduleId, reason, }: PauseScheduleOptions): Promise<null>;
declare type UnpauseScheduleOptions = {
    namespace: string;
    scheduleId: string;
    reason: string;
};
export declare function unpauseSchedule({ namespace, scheduleId, reason, }: UnpauseScheduleOptions): Promise<null>;
export {};
