
export function convertToEUUnits(value: number, unit: string): { value: number; unit: string } {
  switch (unit.toLowerCase()) {
    case 'oz':
      return { value: value * 28.35, unit: 'g' }; // ounces to grams
    case 'lb':
      return { value: value * 0.453592, unit: 'kg' }; // pounds to kilograms
    case 'fl oz':
      return { value: value * 29.5735, unit: 'ml' }; // fluid ounces to milliliters
    case 'cup':
      return { value: value * 236.588, unit: 'ml' }; // cups to milliliters
    case 'inch':
      return { value: value * 2.54, unit: 'cm' }; // inches to centimeters
    default:
      return { value, unit }; // return original if no conversion needed
  }
}
