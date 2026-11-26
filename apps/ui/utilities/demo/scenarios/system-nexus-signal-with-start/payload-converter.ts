import {
  CompositePayloadConverter,
  defaultPayloadConverter,
  type Payload,
  type PayloadConverterWithEncoding,
} from '@temporalio/common';
import protoPkg from '@temporalio/proto';

const { temporal } = protoPkg;

type ProtoCodec = {
  encode: (message: unknown) => { finish: () => Uint8Array };
  decode: (data: Uint8Array) => unknown;
};

/** The messages the system Nexus endpoint speaks for this operation. */
const MESSAGES: Record<string, ProtoCodec> = {
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest':
    temporal.api.workflowservice.v1
      .SignalWithStartWorkflowExecutionRequest as unknown as ProtoCodec,
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse':
    temporal.api.workflowservice.v1
      .SignalWithStartWorkflowExecutionResponse as unknown as ProtoCodec,
};

const encodeText = (value: string) => new TextEncoder().encode(value);
const decodeText = (value: Uint8Array | null | undefined) =>
  new TextDecoder().decode(value ?? new Uint8Array());

/**
 * The system Nexus endpoint speaks binary/protobuf workflowservice messages.
 *
 * The SDK's own protobuf converters cannot do this yet: they emit
 * json/protobuf, and they want reflection metadata that the generated classes
 * in `@temporalio/proto` do not carry. This converter is therefore demo-only
 * scaffolding, and it goes away when the SDK gains the operation.
 */
class SystemNexusProtoConverter implements PayloadConverterWithEncoding {
  public readonly encodingType = 'binary/protobuf';

  public toPayload(value: unknown): Payload | undefined {
    if (!value || typeof value !== 'object') return undefined;

    // Those generated namespaces are not constructors, so `instanceof` cannot
    // identify a message. Its prototype names itself instead.
    const messageType = Object.keys(MESSAGES).find(
      (name) => name.split('.').pop() === value.constructor?.name,
    );

    if (!messageType) return undefined;

    return {
      metadata: {
        encoding: encodeText(this.encodingType),
        messageType: encodeText(messageType),
      },
      data: MESSAGES[messageType].encode(value).finish(),
    };
  }

  public fromPayload<T>(payload: Payload): T {
    const messageType = decodeText(payload.metadata?.messageType);
    const codec = MESSAGES[messageType];

    if (!codec) {
      throw new Error(`No proto codec for message type "${messageType}"`);
    }

    // A response crosses into the workflow sandbox, so its buffer belongs to
    // another realm and protobufjs rejects it. Re-wrap it in this realm's view.
    return codec.decode(new Uint8Array(payload.data ?? [])) as T;
  }
}

export const payloadConverter = new CompositePayloadConverter(
  new SystemNexusProtoConverter(),
  ...(defaultPayloadConverter as CompositePayloadConverter).converters,
);
