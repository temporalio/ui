export declare const handleError: (error: unknown, notifications?: import("svelte/store").Readable<{
    id: string;
    type: "error" | "warning" | "success" | "information";
    message: string;
    expiration: number;
}[]> & {
    add: (type: "error" | "warning" | "success" | "information", message: string, duration?: number) => void;
    dismiss: (id: string) => void;
    clear: () => void;
}, errors?: import("svelte/store").Writable<any>, isBrowser?: any) => void;
export declare const handleUnauthorizedOrForbiddenError: (error: unknown, isBrowser?: any) => void;
