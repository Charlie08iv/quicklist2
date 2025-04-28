
export function convertToEUUnits(value: number, unit: string): { value: number; unit: string } {
  switch (unit.toLowerCase()) {
    case 'dkg':
      return { value: value * 10, unit: 'g' }; // decagrams to grams
    case 'ml':
      return { value: value, unit: 'ml' }; // milliliters stay as is
    case 'l':
      return { value: value * 1000, unit: 'ml' }; // liters to milliliters
    case 'kg':
      return { value: value * 1000, unit: 'g' }; // kilograms to grams
    default:
      return { value, unit }; // return original if no conversion needed
  }
}
