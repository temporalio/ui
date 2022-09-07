import type { Readable } from 'svelte/store';
declare type NotificationType = 'error' | 'warning' | 'success' | 'information';
declare type Notification = {
    id: string;
    type: NotificationType;
    message: string;
    expiration: number;
};
declare type Notifications = Notification[];
declare const add: (type: NotificationType, message: string, duration?: number) => void;
declare const dismiss: (id: string) => void;
declare const clear: () => void;
export declare const notifications: Readable<Notifications> & {
    add: typeof add;
    dismiss: typeof dismiss;
    clear: typeof clear;
};
export {};
