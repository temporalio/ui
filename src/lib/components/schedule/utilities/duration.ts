import {
  parseDuration,
  type Unit,
} from '$lib/holocene/duration-input/duration-input.svelte';

function sortUnitsLargestToSmallest<T extends string>(units: Unit<T>[]) {
  return units.toSorted((a, b) => b.convert(1) - a.convert(1));
}

export function getLargestWholeUnit<T extends string>(
  durationString: string,
  units: Unit<T>[],
): { value: number; unit: Unit<T> } {
  if (!units.length) {
    throw new RangeError('units must contain at least one unit');
  }

  const sortedUnits = sortUnitsLargestToSmallest(units);
  const seconds = Number(parseDuration(durationString));

  if (seconds !== 0) {
    for (const unit of sortedUnits) {
      const oneUnit = unit.convert(1);
      const valueInUnit = seconds / oneUnit;

      if (Number.isInteger(valueInUnit)) {
        return {
          value: valueInUnit,
          unit,
        };
      }
    }
  }

  // Does not evenly go into any given unit.
  // Use smallest unit
  const smallestUnit = sortedUnits[sortedUnits.length - 1];

  return {
    value: seconds / smallestUnit.convert(1),
    unit: smallestUnit,
  };
}
