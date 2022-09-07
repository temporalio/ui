import { writable } from 'svelte/store';
const whenIdle = (globalThis === null || globalThis === void 0 ? void 0 : globalThis.requestIdleCallback) ||
    ((fn) => {
        setTimeout(fn, 0);
    });
const store = writable([], () => {
    const interval = setInterval(() => {
        whenIdle(() => {
            const now = Date.now();
            store.update((ns) => {
                return ns.filter((n) => n.expiration < now);
            });
        });
    }, 5000);
    return () => {
        clearInterval(interval);
    };
});
const createNotification = (type, message, duration = 30) => {
    const now = Date.now();
    return {
        id: String(now + Math.random()),
        type,
        message,
        expiration: now + duration * 1000,
    };
};
const add = (type, message, duration = 30) => {
    store.update((ns) => [...ns, createNotification(type, message, duration)]);
};
const dismiss = (id) => {
    store.update((ns) => ns.filter((n) => n.id !== id));
};
const clear = () => {
    store.set([]);
};
export const notifications = {
    subscribe: store.subscribe,
    add,
    dismiss,
    clear,
};
