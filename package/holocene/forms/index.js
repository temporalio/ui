export function setBodyProperty(path, body, value) {
    const properties = path.split('.');
    return properties.reduce((o, p, index) => (o[p] = (properties === null || properties === void 0 ? void 0 : properties.length) === ++index ? value : o[p] || {}), body);
}
