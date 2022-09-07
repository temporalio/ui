import { browser } from '$app/env';
import { settings } from '../stores/settings';
import { getApiOrigin } from '../utilities/get-api-origin';
import { getEnvironment } from '../utilities/get-environment';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export const isCloudMatch = /(tmprl\.cloud|tmprl-test\.cloud)$/;
export const fetchSettings = async (request = fetch) => {
    var _a, _b, _c, _d;
    const settingsResponse = await requestFromAPI(routeForApi('settings'), { request });
    const EnvironmentOverride = getEnvironment();
    const settingsInformation = {
        auth: {
            enabled: !!((_a = settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.Auth) === null || _a === void 0 ? void 0 : _a.Enabled),
            options: (_b = settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.Auth) === null || _b === void 0 ? void 0 : _b.Options,
        },
        baseUrl: getApiOrigin(),
        codec: {
            endpoint: (_c = settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.Codec) === null || _c === void 0 ? void 0 : _c.Endpoint,
            accessToken: (_d = settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.Codec) === null || _d === void 0 ? void 0 : _d.AccessToken,
        },
        defaultNamespace: (settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.DefaultNamespace) || 'default',
        disableWriteActions: !!(settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.DisableWriteActions) || false,
        showTemporalSystemNamespace: settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.ShowTemporalSystemNamespace,
        notifyOnNewVersion: settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.NotifyOnNewVersion,
        feedbackURL: settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.FeedbackURL,
        runtimeEnvironment: {
            get isCloud() {
                if (EnvironmentOverride) {
                    return EnvironmentOverride === 'cloud';
                }
                return isCloudMatch.test(browser ? window.location.hostname : '');
            },
            get isLocal() {
                if (EnvironmentOverride) {
                    return EnvironmentOverride === 'local';
                }
                return isCloudMatch.test(browser ? window.location.hostname : '');
            },
            envOverride: Boolean(EnvironmentOverride),
        },
        version: settingsResponse === null || settingsResponse === void 0 ? void 0 : settingsResponse.Version,
    };
    settings.set(settingsInformation);
    return settingsInformation;
};
