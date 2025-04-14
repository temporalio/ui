/*
 * This function is probably a bit obtuse, so lets break it down:
 *
1. **Generic Function**: 
   - The function `mapEntries` is a generic function, which means it can work
   with any data types specified at the time of calling. It uses four generic
   type parameters: `T`, `U`, `V`, and `W`.

2. **Type Parameters**:
   - `T`: Represents the type of the values in the input object `obj`.
   - `U`: Represents the type of the values in the output object.
   - `V`: A record type where keys are strings and values are of type `T`.
   - `W`: A record type where keys are strings and values are of type `U`.

3. **Function Parameters**:
   - `obj: V`: The input object, which is a record with string keys and values
   of type `T`.
   - `fn: (value: T) => U`: A function that takes a value of type `T` and
   returns a value of type `U`.

4. **Function Logic**:
   - `Object.entries(obj)`: Converts the input object `obj` into an array of 
   key-value pairs.
   - `.map(([key, value]) => [key, fn(value)])`: Iterates over each key-value
   pair, applying the function `fn` to each value. It returns a new array of
   key-value pairs where the values have been transformed by `fn`.
   - `Object.fromEntries(...)`: Converts the array of transformed key-value
   pairs back into an object.

5. **Return Type**:
   - The function returns an object of type `W`, which is a record with the 
     same keys as the input object but with values transformed to type `U`.

### Example

Suppose you have an object representing search attributes in a workflow, and
you want to convert the property values from screaming enums to humanized names. 
Here's how you might use `mapEntries` to achieve this:

#### Input

Suppose you have an object representing search attributes with screaming enum
values:

```typescript
const searchAttributes = {
  attribute1: 'INDEXED_VALUE_TYPE_STRING',
  attribute2: 'INDEXED_VALUE_TYPE_INT',
  attribute3: 'INDEXED_VALUE_TYPE_BOOL',
};
```

#### Transformation Function

We'll use the `toSearchAttributeTypeReadable` function to convert these
screaming enum values into a more readable format:

```typescript
import { toSearchAttributeTypeReadable } from '$lib/utilities/screaming-enums';

const humanizedAttributes = mapEntries(searchAttributes, toSearchAttributeTypeReadable);
```

#### Output

The `humanizedAttributes` object will be:

```typescript
{
  attribute1: 'String',
  attribute2: 'Int',
  attribute3: 'Bool',
}
```

### Explanation

- **Input Object**: `searchAttributes` is an object where each key is an
attribute name and each value is a screaming enum representing the attribute
type.
- **Transformation Function**: `toSearchAttributeTypeReadable` converts each
screaming enum value into a human-readable string by removing the prefix and
capitalizing the first letter of each word.
- **Output Object**: `humanizedAttributes` is the result of applying
`mapEntries` to `searchAttributes` with `toSearchAttributeTypeReadable`. It has
the same keys as `searchAttributes`, but the values are transformed to a more
readable format.
*/
export function mapEntries<
  T,
  U,
  V extends Record<string, T>,
  W extends Record<string, U>,
>(obj: V, fn: (value: T) => U): W {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  ) as W;
}
