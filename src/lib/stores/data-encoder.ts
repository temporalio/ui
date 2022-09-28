import { derived } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import {
  dataEncoderEndpoint,
  lastDataEncoderStatus,
} from './data-encoder-config';
import { user } from './user';

export const dataEncoder = derived(
  [
    page,
    dataEncoderEndpoint,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
    user,
  ],
  ([
    $page,
    $dataEncoderEndpoint,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
    $user,
  ]) => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.stuff?.settings?.codec?.endpoint;
    const endpoint = $dataEncoderEndpoint || settingsEndpoint;
    const passAccessToken = $page.stuff?.settings?.codec?.passAccessToken;
    const accessToken = $user?.accessToken;
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
      passAccessToken,
      accessToken,
      hasNotRequested,
      hasError,
      hasSuccess,
      hasEndpointAndPortConfigured,
      hasEndpointOrPortConfigured,
    };
  },
);
