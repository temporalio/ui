import { z } from 'zod';

/**Contains an arbitrary serialized message along with a @type that describes the type of the serialized message.*/
export const GoogleProtobufAny = z
  .object({
    /**The type of the serialized message.*/
    '@type': z
      .string()
      .describe('The type of the serialized message.')
      .optional(),
  })
  .catchall(z.any())
  .describe(
    'Contains an arbitrary serialized message along with a @type that describes the type of the serialized message.',
  );
export type GoogleProtobufAny = z.infer<typeof GoogleProtobufAny>;
