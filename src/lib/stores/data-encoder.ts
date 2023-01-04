import { derived } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import { codecEndpoint, lastDataEncoderStatus } from './data-encoder-config';

export const dataEncoder = derived(
  [
    page,
    codecEndpoint,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
  ],
  ([
    $page,
    $codecEndpoint,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
  ]) => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.data?.settings?.codec?.endpoint;
    const endpoint = $codecEndpoint || settingsEndpoint;
    const accessToken = $page?.data?.user?.accessToken;
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
  },
);
