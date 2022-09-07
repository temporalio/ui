export declare const dataConverterPort: Pick<import("svelte/store").Writable<any>, "subscribe" | "set">;
export declare const lastDataConverterStatus: import("svelte/store").Writable<DataEncoderStatus>;
export declare function setLastDataConverterFailure(error?: string): void;
export declare function setLastDataConverterSuccess(): void;
export declare function resetLastDataConverterSuccess(): void;
