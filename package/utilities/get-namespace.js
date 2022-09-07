export const getNamespace = ({ namespace, defaultNamespace, namespaces, }) => {
    if (!namespace)
        return defaultNamespace;
    if (!(namespaces === null || namespaces === void 0 ? void 0 : namespaces.length))
        return defaultNamespace;
    if (namespaces.find((ns) => { var _a; return ((_a = ns === null || ns === void 0 ? void 0 : ns.namespaceInfo) === null || _a === void 0 ? void 0 : _a.name) === namespace; })) {
        return namespace;
    }
    return undefined;
};
export const getDefaultNamespace = ({ namespaces = [], settings, }) => {
    var _a, _b;
    const { showTemporalSystemNamespace, defaultNamespace } = settings;
    const namespaceNames = namespaces
        .map((namespace) => { var _a; return (_a = namespace === null || namespace === void 0 ? void 0 : namespace.namespaceInfo) === null || _a === void 0 ? void 0 : _a.name; })
        .filter((namespace) => showTemporalSystemNamespace || namespace !== 'temporal-system');
    return ((_b = (_a = namespaceNames.find((ns) => ns === defaultNamespace)) !== null && _a !== void 0 ? _a : namespaceNames[0]) !== null && _b !== void 0 ? _b : defaultNamespace);
};
