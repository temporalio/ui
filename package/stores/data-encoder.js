import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { dataConverterPort, lastDataConverterStatus, } from './data-converter-config';
import { dataEncoderEndpoint, lastDataEncoderStatus, } from './data-encoder-config';
export const dataEncoder = derived([
    page,
    dataEncoderEndpoint,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
], ([$page, $dataEncoderEndpoint, $lastDataEncoderStatus, $dataConverterPort, $lastDataConverterStatus,]) => {
    var _a, _b;
    const namespace = $page.params.namespace;
    const settingsEndpoint = (_a = $page.stuff.settings.codec) === null || _a === void 0 ? void 0 : _a.endpoint;
    const endpoint = $dataEncoderEndpoint || settingsEndpoint;
    const accessToken = (_b = $page.stuff.settings.codec) === null || _b === void 0 ? void 0 : _b.accessToken;
    const hasNotRequested = endpoint
        ? $lastDataEncoderStatus === 'notRequested'
        : $lastDataConverterStatus === 'notRequested';
    const hasError = endpoint
        ? $lastDataEncoderStatus === 'error'
        : $lastDataConverterStatus === 'error';
    const hasSuccess = endpoint
        ? $lastDataEncoderStatus === 'success'
        : $lastDataConverterStatus === 'success';
    const hasEndpointAndPortConfigured = endpoint && $dataConverterPort;
    const hasEndpointOrPortConfigured = endpoint || $dataConverterPort;
    return {
        namespace,
        settingsEndpoint,
        endpoint,
        accessToken,
        hasNotRequested,
        hasError,
        hasSuccess,
        hasEndpointAndPortConfigured,
        hasEndpointOrPortConfigured,
    };
});
