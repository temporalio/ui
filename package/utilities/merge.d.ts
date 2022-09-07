declare type KeyValue = {
    [key: string]: string | number | boolean;
};
export declare const merge: <T = KeyValue>(first?: T, second?: T) => T;
export {};
