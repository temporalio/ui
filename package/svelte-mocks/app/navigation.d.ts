export declare function disableScrollHandling(): void;
export declare function goto(url: string | URL, opts?: {
    replaceState?: boolean;
    noscroll?: boolean;
    keepfocus?: boolean;
    state?: any;
}): Promise<void>;
export declare function invalidate(dependency: string | ((href: string) => boolean)): Promise<void>;
export declare function prefetch(href: string): Promise<void>;
export declare function prefetchRoutes(routes?: string[]): Promise<void>;
export declare function beforeNavigate(fn: (navigation: {
    from: URL;
    to: URL | null;
    cancel: () => void;
}) => void): void;
export declare function afterNavigate(fn: (navigation: {
    from: URL | null;
    to: URL;
}) => void): void;
