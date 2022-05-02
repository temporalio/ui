import { derived } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import { lastDataEncoderStatus } from './data-encoder-config';

export const dataEncoder = derived(
  [page, lastDataEncoderStatus, dataConverterPort, lastDataConverterStatus],
  ([
    $page,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
  ]) => {
    const namespace = $page.params.namespace;
    const endpoint = $page.stuff.settings.codec?.endpoint;
    const accessToken = $page.stuff.settings.codec?.accessToken;
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
      endpoint,
      accessToken,
      hasNotRequested,
      hasError,
      hasSuccess,
      hasEndpointAndPortConfigured,
      hasEndpointOrPortConfigured,
    };
  },
);
