import { describe, expect, it } from 'vitest';

/**
 * This scenario ships a caller workflow and a payload converter only because
 * the TypeScript SDK cannot send this operation yet. These tests fail when that
 * stops being true, so the scaffolding is deleted deliberately rather than
 * carried forever.
 *
 * The Python SDK already has the plumbing on main, and the caller API
 * (`workflow.signal_with_start_workflow`) on a branch, so this is a question of
 * when rather than whether.
 */
describe('the reason this scenario ships its own caller', () => {
  it('fails when the SDK gains a signal-with-start workflow API', async () => {
    const workflow = await import('@temporalio/workflow');

    const supported = Object.keys(workflow).filter((name) =>
      /signalWithStart/i.test(name),
    );

    expect(
      supported,
      [
        `@temporalio/workflow now exports ${supported.join(', ')}.`,
        'Use it instead: delete caller-workflow.ts and payload-converter.ts,',
        'and call the SDK from the scenario.',
      ].join('\n'),
    ).toEqual([]);
  });

  it('fails when the SDK can encode these messages as binary/protobuf', async () => {
    const { DefaultPayloadConverterWithProtobufs } =
      await import('@temporalio/common/lib/converter/protobuf-payload-converters');
    const protoPkg = await import('@temporalio/proto');

    const converter = new DefaultPayloadConverterWithProtobufs({
      protobufRoot: protoPkg as unknown as Record<string, unknown>,
    });

    const message =
      protoPkg.default.temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest.create(
        { workflowId: 'canary' },
      );

    // The generated classes carry no reflection metadata, so the SDK's own
    // protobuf converters cannot serialize them. If this starts working, the
    // converter in this directory is redundant.
    let encoding: string | undefined;

    try {
      const payload = converter.toPayload(message);
      encoding = new TextDecoder().decode(payload?.metadata?.encoding);
    } catch {
      encoding = undefined;
    }

    expect(
      encoding,
      [
        `The SDK's protobuf converter now produces "${encoding}" for these messages.`,
        'If that is binary/protobuf with a messageType, delete payload-converter.ts',
        'and use the SDK converter.',
      ].join('\n'),
    ).not.toBe('binary/protobuf');
  });
});
