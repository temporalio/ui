export function isNetworkError(error) {
    const networkErr = error;
    return ((networkErr === null || networkErr === void 0 ? void 0 : networkErr.statusCode) !== undefined &&
        (networkErr === null || networkErr === void 0 ? void 0 : networkErr.statusText) !== undefined &&
        (networkErr === null || networkErr === void 0 ? void 0 : networkErr.response) !== undefined);
}
