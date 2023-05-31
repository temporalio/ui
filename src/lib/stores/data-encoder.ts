import { derived } from 'svelte/store';
import { page } from '$app/stores';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import { codecEndpoint, lastDataEncoderStatus } from './data-encoder-config';
import { authUser } from './auth-user';

export const dataEncoder = derived(
  [
    page,
    codecEndpoint,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
    authUser,
  ],
  ([
    $page,
    $codecEndpoint,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
    $authUser,
  ]) => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.data?.settings?.codec?.endpoint;
    const settingsPassAccessToken =
      $page?.data?.settings?.codec?.passAccessToken;
    const settingsIncludeCredentials =
      $page?.data?.settings?.codec?.includeCredentials;
    const endpoint = $codecEndpoint || settingsEndpoint;
    const accessToken = $authUser?.accessToken;
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
      settingsPassAccessToken,
      settingsIncludeCredentials,
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
