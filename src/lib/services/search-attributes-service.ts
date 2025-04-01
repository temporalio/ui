import type { SearchAttributesResponseHumanized } from '$lib/types/workflows';
import { toSearchAttributeTypeReadable } from '$lib/utilities/screaming-enums';
import { temporalDefaultClient } from '$lib/utilities/temporal-client';

export const fetchSearchAttributesForNamespace = async (
  namespace: string,
): Promise<SearchAttributesResponseHumanized> => {
  try {
    const searchAttributesResponse =
      await temporalDefaultClient.listSearchAttributes({ namespace });

    // DEPRECATED
    //
    // const route = routeForApi('search-attributes', { namespace });
    // await requestFromAPI<SearchAttributesResponse>(route, {
    //   request,
    // });
    //
    // const customAttributes = { ...searchAttributesResponse.customAttributes };
    // const systemAttributes = { ...searchAttributesResponse.systemAttributes };
    // Object.entries(customAttributes).forEach(([key, value]) => {
    //   customAttributes[key] = toSearchAttributeTypeReadable(value);
    // });
    // Object.entries(systemAttributes).forEach(([key, value]) => {
    //   systemAttributes[key] = toSearchAttributeTypeReadable(value);
    // });
    //
    // END DEPRECATED

    return {
      customAttributes: mapEntries(
        searchAttributesResponse.customAttributes || {},
        toSearchAttributeTypeReadable,
      ),

      systemAttributes: mapEntries(
        searchAttributesResponse.systemAttributes || {},
        toSearchAttributeTypeReadable,
      ),
    };
  } catch (e) {
    console.error(
      'Error fetching search attributes for namespace',
      namespace,
      e,
    );
    return {
      customAttributes: {},
      systemAttributes: {},
    };
  }
};

/*
 * This function is probably a bit obtuse, so lets break it down:
 *
1. **Generic Function**: 
   - The function `mapEntries` is a generic function, which means it can work with any data types specified at the time of calling. It uses four generic type parameters: `T`, `U`, `V`, and `W`.

2. **Type Parameters**:
   - `T`: Represents the type of the values in the input object `obj`.
   - `U`: Represents the type of the values in the output object.
   - `V`: A record type where keys are strings and values are of type `T`.
   - `W`: A record type where keys are strings and values are of type `U`.

3. **Function Parameters**:
   - `obj: V`: The input object, which is a record with string keys and values of type `T`.
   - `fn: (value: T) => U`: A function that takes a value of type `T` and returns a value of type `U`.

4. **Function Logic**:
   - `Object.entries(obj)`: Converts the input object `obj` into an array of key-value pairs.
   - `.map(([key, value]) => [key, fn(value)])`: Iterates over each key-value pair, applying the function `fn` to each value. It returns a new array of key-value pairs where the values have been transformed by `fn`.
   - `Object.fromEntries(...)`: Converts the array of transformed key-value pairs back into an object.

5. **Return Type**:
   - The function returns an object of type `W`, which is a record with the same keys as the input object but with values transformed to type `U`.
*/
function mapEntries<
  T,
  U,
  V extends Record<string, T>,
  W extends Record<string, U>,
>(obj: V, fn: (value: T) => U): W {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  ) as W;
}
