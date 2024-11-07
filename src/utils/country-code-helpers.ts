import { country, subdivision } from 'iso-3166-2';

function isValidISO3166(code: string): boolean {
  try {
    const countryInfo = country(code);
    const subdivisionInfo = subdivision(code);

    return !!countryInfo || !!subdivisionInfo?.name;
  } catch (err) {
    console.warn(`error parsing iso-3166 code: ${code}`, err);
    return false;
  }
}

export { isValidISO3166 };
