declare type Omit = {
    <Source extends object, KeysToOmit extends string[]>(obj: Source, ...keys: KeysToOmit): {
        [RemainingKey in Exclude<keyof Source, KeysToOmit[number]>]: Source[RemainingKey];
    };
};
export declare const omit: Omit;
export {};
