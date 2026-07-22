import { CountryCode } from 'libphonenumber-js';

export interface ExtractTelOptions {
  /**
   * Specific fields to extract from the vCard.
   * Acceptable values are mapped keys (e.g., 'number', 'firstName', 'email', 'version')
   * or any unmapped keys present in the vCard.
   * If empty, all available fields will be included.
   */
  fields?: string[];

  /**
   * If true, returns a flat array of phone numbers instead of contact objects.
   * Default is false.
   */
  onlyNumbers?: boolean;

  /**
   * For onlyNumbers output, retains the '+' prefix if true (default false).
   */
  prefix?: boolean;

  /**
   * Default country code (e.g., 'US', 'GB') to use when parsing national
   * phone numbers via libphonenumber-js.
   */
  countryCode?: CountryCode;

  /**
   * Phone number normalization option:
   * - true: Normalize to E.164 using libphonenumber-js (falls back to basic cleaning if invalid).
   * - false/undefined: No complex validation, performs basic formatting (stripping spaces/hyphens).
   * - function: Custom formatting/validation callback.
   */
  normalize?: boolean | ((phone: string) => string);

  /**
   * Custom key mappings to override/extend default mappings:
   * Default is:
   * - TEL => number
   * - FN => firstName
   * - EMAIL => email
   * - VERSION => version
   */
  mappings?: Record<string, string>;

  /**
   * How to handle properties that appear multiple times in a single contact.
   * - 'array': Always convert to array if multiple values exist.
   * - 'last': Keep only the last value (backwards compatible with v1).
   * Default is 'array'.
   */
  multiValueMode?: 'array' | 'last';

  /**
   * If true, includes parameter metadata for each parsed field on the contact
   * under a special `params` property.
   * Default is false.
   */
  params?: boolean;
}

export interface Contact {
  number?: string | string[];
  firstName?: string | string[];
  email?: string | string[];
  version?: string | string[];
  params?: Record<string, Record<string, string[]>[]>;
  [key: string]: any;
}
