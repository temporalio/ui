import type {
  Payload,
  PayloadCodec as TPayloadCodec,
} from '@temporalio/common';

export class PayloadCodec implements TPayloadCodec {
  async encode(payloads: Payload[]): Promise<Payload[]> {
    return payloads;
    // return Promise.all(
    //   payloads.map(async (payload) => {
    //     return {
    //       metadata: {
    //         [METADATA_ENCODING_KEY]: encode(ENCODING),
    //       },
    //       data: payload.data,
    //     };
    //   }),
    // );
  }

  async decode(payloads: Payload[]): Promise<Payload[]> {
    return payloads;
    // return Promise.all(
    //   payloads.map(async (payload) => {
    //     return {
    //       metadata: {
    //         [METADATA_ENCODING_KEY]: encode(ENCODING),
    //       },
    //       data: payload.data,
    //     };
    //   }),
    // );
  }
}
