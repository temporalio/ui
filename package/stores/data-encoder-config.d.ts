export declare const dataEncoderEndpoint: Pick<import("svelte/store").Writable<any>, "subscribe" | "set">;
export declare const lastDataEncoderStatus: import("svelte/store").Writable<DataEncoderStatus>;
export declare function setLastDataEncoderFailure(): void;
export declare function setLastDataEncoderSuccess(): void;
export declare function resetLastDataEncoderSuccess(): void;
