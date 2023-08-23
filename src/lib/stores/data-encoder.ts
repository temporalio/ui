import { derived } from 'svelte/store';

import { page } from '$app/stores';

import { authUser } from './auth-user';
import {
  dataConverterPort,
  lastDataConverterStatus,
} from './data-converter-config';
import {
  codecEndpoint,
  lastDataEncoderStatus,
  overrideRemoteCodecConfiguration,
} from './data-encoder-config';

type DataEncoder = {
  namespace: string;
  settingsEndpoint?: string;
  settingsPassAccessToken: boolean;
  settingsIncludeCredentials: boolean;
  endpoint: string;
  accessToken?: string;
  hasNotRequested: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  hasEndpointAndPortConfigured: boolean;
  hasEndpointOrPortConfigured: boolean;
};

export const dataEncoder = derived(
  [
    page,
    codecEndpoint,
    overrideRemoteCodecConfiguration,
    lastDataEncoderStatus,
    dataConverterPort,
    lastDataConverterStatus,
    authUser,
  ],
  ([
    $page,
    $codecEndpoint,
    $overrideRemoteCodecConfiguration,
    $lastDataEncoderStatus,
    $dataConverterPort,
    $lastDataConverterStatus,
    $authUser,
  ]): DataEncoder => {
    const namespace = $page.params.namespace;
    const settingsEndpoint = $page?.data?.settings?.codec?.endpoint;
    const settingsPassAccessToken = Boolean(
      $page?.data?.settings?.codec?.passAccessToken,
    );
    const settingsIncludeCredentials = Boolean(
      $page?.data?.settings?.codec?.includeCredentials,
    );
    const endpoint = $overrideRemoteCodecConfiguration
      ? $codecEndpoint
      : settingsEndpoint || $codecEndpoint;
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
    const hasEndpointAndPortConfigured = Boolean(
      endpoint && $dataConverterPort,
    );
    const hasEndpointOrPortConfigured = Boolean(endpoint || $dataConverterPort);

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
