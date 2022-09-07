export const isAuthorized = (settings, user) => {
    return !settings.auth.enabled || Boolean(user === null || user === void 0 ? void 0 : user.email);
};
