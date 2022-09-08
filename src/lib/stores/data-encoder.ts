import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import {
  dataEncoderEndpoint,
  lastDataEncoderStatus,
} from './data-encoder-config';

export const showDataEncoderSettings = writable(false);

export const dataEncoder = derived(
  [
    page,
    dataEncoderEndpoint,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
  ],
  ([
    $page,
    $dataEncoderEndpoint,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
  ]) => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.stuff?.settings?.codec?.endpoint;
    const endpoint = $dataEncoderEndpoint || settingsEndpoint;
    const accessToken = $page.stuff?.settings?.codec?.accessToken;
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
