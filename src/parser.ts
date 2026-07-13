import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { ExtractTelOptions, Contact } from './types';

const DEFAULT_MAPPINGS: Record<string, string> = {
  TEL: 'number',
  FN: 'firstName',
  EMAIL: 'email',
  VERSION: 'version',
};

/**
 * Unfolds folded lines in vCard data as per RFC 6350.
 * Long lines are folded by inserting a line break followed by a space or tab.
 */
export function unfoldVcard(data: string): string {
  return data.replace(/\r?\n[ \t]/g, '');
}

/**
 * Unescapes special characters in vCard property values.
 */
export function unescapeValue(val: string): string {
  return val
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Normalizes a phone number based on options.
 */
export function normalizePhone(
  phone: string,
  normalizeOpt?: boolean | ((p: string) => string),
  countryCode?: CountryCode
): string {
  if (typeof normalizeOpt === 'function') {
    return normalizeOpt(phone);
  }

  if (normalizeOpt === true) {
    try {
      const parsed = parsePhoneNumberFromString(phone, countryCode);
      if (parsed && parsed.isValid()) {
        return parsed.format('E.164');
      }
    } catch {
      // Fallback on error
    }
    // Fallback normalization: strip non-digits, keep leading '+'
    return phone.replace(/[^\d+]/g, '');
  }

  // Default v1-compatible formatting: replace spaces/hyphens with space
  return phone.replace(/-|\s/g, ' ');
}

/**
 * Core function to parse a vCard string into Contact objects or normalized phone number strings.
 */
export function parseVcard(data: string, options: ExtractTelOptions = {}): Contact[] | string[] {
  const {
    fields = [],
    onlyNumbers = false,
    prefix = false,
    countryCode,
    normalize,
    mappings = {},
    multiValueMode = 'array',
  } = options;

  const keyMappings = { ...DEFAULT_MAPPINGS, ...mappings };

  const unfolded = unfoldVcard(data);
  const lines = unfolded.split(/\r?\n/);

  const contacts: Contact[] = [];
  let currentContact: Contact = {};

  const saveCurrentContact = () => {
    // Delete any empty keys that might have been created by malformed lines
    delete currentContact[''];
    if (Object.keys(currentContact).length > 0) {
      contacts.push(currentContact);
      currentContact = {};
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      continue;
    }

    const keyPart = trimmed.substring(0, colonIdx);
    const valPart = trimmed.substring(colonIdx + 1);

    // Extract group if present (e.g. item1.TEL -> group: item1, key: TEL)
    let restOfKey = keyPart;
    const dotIdx = keyPart.indexOf('.');
    const semiIdx = keyPart.indexOf(';');
    if (dotIdx !== -1 && (semiIdx === -1 || dotIdx < semiIdx)) {
      restOfKey = keyPart.substring(dotIdx + 1);
    }

    // Split parameters to get the base property name
    const paramParts = restOfKey.split(';');
    const rawKey = paramParts[0].toUpperCase();

    if (rawKey === 'BEGIN') {
      saveCurrentContact();
      continue;
    }

    if (rawKey === 'END') {
      saveCurrentContact();
      continue;
    }

    const mappedKey = keyMappings[rawKey] || rawKey;

    // Filter fields if options.fields is specified
    if (fields.length > 0 && !fields.includes(mappedKey)) {
      continue;
    }

    let parsedVal = unescapeValue(valPart);

    if (mappedKey === 'number' || rawKey === 'TEL') {
      parsedVal = normalizePhone(parsedVal, normalize, countryCode);
    }

    // Handle multi-value fields
    if (currentContact[mappedKey] !== undefined) {
      if (multiValueMode === 'array') {
        const existing = currentContact[mappedKey];
        if (Array.isArray(existing)) {
          existing.push(parsedVal);
        } else {
          currentContact[mappedKey] = [existing, parsedVal];
        }
      } else {
        currentContact[mappedKey] = parsedVal;
      }
    } else {
      currentContact[mappedKey] = parsedVal;
    }
  }

  saveCurrentContact();

  if (onlyNumbers) {
    const phoneNumbers: string[] = [];
    for (const contact of contacts) {
      const nums = contact.number;
      if (!nums) continue;
      const numList = Array.isArray(nums) ? nums : [nums];
      for (let num of numList) {
        // Strip spaces/hyphens for onlyNumbers array output
        let cleaned = num.replace(/[^\d+]/g, '');
        // Strip plus prefix if prefix option is false
        if (!prefix && cleaned.startsWith('+')) {
          cleaned = cleaned.substring(1);
        }
        // Filter out unwanted single digits like '3' or '0'
        if (/^3$|^0$/.test(cleaned) || !cleaned) {
          continue;
        }
        phoneNumbers.push(cleaned);
      }
    }
    return phoneNumbers;
  }

  return contacts;
}
