/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.replication.v1';

export interface ClusterReplicationConfig {
  clusterName: string;
}

export interface NamespaceReplicationConfig {
  activeClusterName: string;
  clusters: ClusterReplicationConfig[];
}

const baseClusterReplicationConfig: object = { clusterName: '' };

export const ClusterReplicationConfig = {
  encode(
    message: ClusterReplicationConfig,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.clusterName !== '') {
      writer.uint32(10).string(message.clusterName);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ClusterReplicationConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseClusterReplicationConfig,
    } as ClusterReplicationConfig;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clusterName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ClusterReplicationConfig {
    const message = {
      ...baseClusterReplicationConfig,
    } as ClusterReplicationConfig;
    if (object.clusterName !== undefined && object.clusterName !== null) {
      message.clusterName = String(object.clusterName);
    } else {
      message.clusterName = '';
    }
    return message;
  },

  toJSON(message: ClusterReplicationConfig): unknown {
    const obj: any = {};
    message.clusterName !== undefined &&
      (obj.clusterName = message.clusterName);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ClusterReplicationConfig>,
  ): ClusterReplicationConfig {
    const message = {
      ...baseClusterReplicationConfig,
    } as ClusterReplicationConfig;
    if (object.clusterName !== undefined && object.clusterName !== null) {
      message.clusterName = object.clusterName;
    } else {
      message.clusterName = '';
    }
    return message;
  },
};

const baseNamespaceReplicationConfig: object = { activeClusterName: '' };

export const NamespaceReplicationConfig = {
  encode(
    message: NamespaceReplicationConfig,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.activeClusterName !== '') {
      writer.uint32(10).string(message.activeClusterName);
    }
    for (const v of message.clusters) {
      ClusterReplicationConfig.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): NamespaceReplicationConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseNamespaceReplicationConfig,
    } as NamespaceReplicationConfig;
    message.clusters = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.activeClusterName = reader.string();
          break;
        case 2:
          message.clusters.push(
            ClusterReplicationConfig.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NamespaceReplicationConfig {
    const message = {
      ...baseNamespaceReplicationConfig,
    } as NamespaceReplicationConfig;
    message.clusters = [];
    if (
      object.activeClusterName !== undefined &&
      object.activeClusterName !== null
    ) {
      message.activeClusterName = String(object.activeClusterName);
    } else {
      message.activeClusterName = '';
    }
    if (object.clusters !== undefined && object.clusters !== null) {
      for (const e of object.clusters) {
        message.clusters.push(ClusterReplicationConfig.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: NamespaceReplicationConfig): unknown {
    const obj: any = {};
    message.activeClusterName !== undefined &&
      (obj.activeClusterName = message.activeClusterName);
    if (message.clusters) {
      obj.clusters = message.clusters.map((e) =>
        e ? ClusterReplicationConfig.toJSON(e) : undefined,
      );
    } else {
      obj.clusters = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<NamespaceReplicationConfig>,
  ): NamespaceReplicationConfig {
    const message = {
      ...baseNamespaceReplicationConfig,
    } as NamespaceReplicationConfig;
    message.clusters = [];
    if (
      object.activeClusterName !== undefined &&
      object.activeClusterName !== null
    ) {
      message.activeClusterName = object.activeClusterName;
    } else {
      message.activeClusterName = '';
    }
    if (object.clusters !== undefined && object.clusters !== null) {
      for (const e of object.clusters) {
        message.clusters.push(ClusterReplicationConfig.fromPartial(e));
      }
    }
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
