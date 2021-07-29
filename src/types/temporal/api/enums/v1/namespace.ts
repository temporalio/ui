/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum NamespaceState {
  NAMESPACE_STATE_UNSPECIFIED = 0,
  NAMESPACE_STATE_REGISTERED = 1,
  NAMESPACE_STATE_DEPRECATED = 2,
  NAMESPACE_STATE_DELETED = 3,
  UNRECOGNIZED = -1,
}

export function namespaceStateFromJSON(object: any): NamespaceState {
  switch (object) {
    case 0:
    case 'NAMESPACE_STATE_UNSPECIFIED':
      return NamespaceState.NAMESPACE_STATE_UNSPECIFIED;
    case 1:
    case 'NAMESPACE_STATE_REGISTERED':
      return NamespaceState.NAMESPACE_STATE_REGISTERED;
    case 2:
    case 'NAMESPACE_STATE_DEPRECATED':
      return NamespaceState.NAMESPACE_STATE_DEPRECATED;
    case 3:
    case 'NAMESPACE_STATE_DELETED':
      return NamespaceState.NAMESPACE_STATE_DELETED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NamespaceState.UNRECOGNIZED;
  }
}

export function namespaceStateToJSON(object: NamespaceState): string {
  switch (object) {
    case NamespaceState.NAMESPACE_STATE_UNSPECIFIED:
      return 'NAMESPACE_STATE_UNSPECIFIED';
    case NamespaceState.NAMESPACE_STATE_REGISTERED:
      return 'NAMESPACE_STATE_REGISTERED';
    case NamespaceState.NAMESPACE_STATE_DEPRECATED:
      return 'NAMESPACE_STATE_DEPRECATED';
    case NamespaceState.NAMESPACE_STATE_DELETED:
      return 'NAMESPACE_STATE_DELETED';
    default:
      return 'UNKNOWN';
  }
}

export enum ArchivalState {
  ARCHIVAL_STATE_UNSPECIFIED = 0,
  ARCHIVAL_STATE_DISABLED = 1,
  ARCHIVAL_STATE_ENABLED = 2,
  UNRECOGNIZED = -1,
}

export function archivalStateFromJSON(object: any): ArchivalState {
  switch (object) {
    case 0:
    case 'ARCHIVAL_STATE_UNSPECIFIED':
      return ArchivalState.ARCHIVAL_STATE_UNSPECIFIED;
    case 1:
    case 'ARCHIVAL_STATE_DISABLED':
      return ArchivalState.ARCHIVAL_STATE_DISABLED;
    case 2:
    case 'ARCHIVAL_STATE_ENABLED':
      return ArchivalState.ARCHIVAL_STATE_ENABLED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ArchivalState.UNRECOGNIZED;
  }
}

export function archivalStateToJSON(object: ArchivalState): string {
  switch (object) {
    case ArchivalState.ARCHIVAL_STATE_UNSPECIFIED:
      return 'ARCHIVAL_STATE_UNSPECIFIED';
    case ArchivalState.ARCHIVAL_STATE_DISABLED:
      return 'ARCHIVAL_STATE_DISABLED';
    case ArchivalState.ARCHIVAL_STATE_ENABLED:
      return 'ARCHIVAL_STATE_ENABLED';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
