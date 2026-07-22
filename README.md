# vcfTelExtractor

`vcfTelExtractor` is a robust, lightweight, and spec-compliant vCard (.vcf) parser for Node.js and the browser. Written in TypeScript, it supports dual CommonJS/ESM modules, correct line unfolding, and phone number normalization via `libphonenumber-js`.

## Features
* **Isomorphic:** Runs seamlessly in both Node.js (reading from files or strings) and browser environments (reading from strings).
* **Dual package:** Support for both ESM `import` and CommonJS `require()`.
* **RFC Spec Compliant:** Correctly handles vCard line unfolding, unescaping, and parameter/group attributes.
* **Phone Normalization:** Clean and format numbers using `libphonenumber-js` (e.g., converting local numbers to E.164 format).
* **Multi-Value Fields:** Handles contacts with multiple phone numbers or emails by default (converting to arrays), with optional backward compatibility.

---

## Installation

```sh
npm install vcftelextractor
```

---

## Usage

### Importing the Module

**ES Modules (ESM) / TypeScript:**
```typescript
import extractTel, { parseVcard } from 'vcftelextractor';
```

**CommonJS:**
```javascript
const extractTel = require('vcftelextractor');
// The direct string parser is also attached:
// const { parseVcard } = extractTel;
```

---

### API Guide

#### `extractTel(input, options?)`
Core function. In Node.js, it accepts a file path or a raw vCard string. In the browser, it accepts a raw vCard string. Returns a `Promise`.

* **`input` (String):** The path to the vCard file (Node.js only) or raw vCard string content.
* **`options` (Object):** Optional configuration object:
  * **`fields` (Array<String>):** List of mapped fields to include in the output. If empty, all available fields are included.
  * **`onlyNumbers` (Boolean):** If `true`, returns a flat array of phone number strings (spaces/hyphens stripped). Default is `false`.
  * **`prefix` (Boolean):** If `true`, includes the `+` prefix for phone numbers in `onlyNumbers` output. Default is `false`.
  * **`normalize` (Boolean | Function):** Normalization strategy:
    * `true`: Normalizes numbers to E.164 format using `libphonenumber-js`.
    * `false` (default): Cleans formatting (replaces hyphens/spaces with a space) for backward compatibility.
    * `Function`: Custom callback `(phone: string) => string`.
  * **`countryCode` (String):** Default country code (e.g., `'US'`, `'GB'`) to use for national phone numbers when `normalize: true`.
  * **`mappings` (Object):** Custom key mappings to extend or override default mappings. Default mappings:
    * `TEL` => `number`
    * `FN` => `firstName`
    * `EMAIL` => `email`
    * `VERSION` => `version`
  * **`multiValueMode` (String):** Action for fields appearing multiple times per contact:
    * `'array'` (default): Combines values into an array (e.g., `number: ['+123', '+456']`).
    * `'last'`: Overwrites with the last value (v1 behavior).
  * **`params` (Boolean):** If `true`, includes parameter attributes (like `TYPE=CELL`) in a nested metadata `params` property for each contact. Default is `false`.

#### `parseVcard(vcardString, options?)`
A synchronous, browser-safe function that parses a raw vCard string content directly.

---

### Examples

#### Example 1: Basic Node.js File Extraction
```javascript
const extractTel = require('vcftelextractor');

extractTel('./contacts.vcf')
  .then(contacts => console.log(contacts))
  .catch(err => console.error(err));
```

#### Example 2: Normalizing Phone Numbers (ESM)
```typescript
import extractTel from 'vcftelextractor';

const result = await extractTel('./contacts.vcf', {
  normalize: true,
  countryCode: 'US', // Parse US local format numbers like (650) 555-0100
});
console.log(result);
// Output phone numbers will be normalized to E.164: '+16505550100'
```

#### Example 3: Direct String Parsing (Browser-Safe)
```javascript
import { parseVcard } from 'vcftelextractor';

const rawVcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Doe
TEL;TYPE=CELL:+15555555555
END:VCARD`;

const contacts = parseVcard(rawVcard, { fields: ['firstName', 'number'] });
console.log(contacts);
// [{ firstName: 'Jane Doe', number: '+15555555555' }]
```

#### Example 4: Extracting Parameters and Attributes
```javascript
import { parseVcard } from 'vcftelextractor';

const rawVcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Doe
TEL;TYPE=CELL,VOICE;VALUE=uri:+15555555555
END:VCARD`;

const contacts = parseVcard(rawVcard, { params: true });
console.log(contacts);
/* Output:
[{
  firstName: 'Jane Doe',
  number: '+15555555555',
  version: '3.0',
  params: {
    number: [{ TYPE: ['CELL', 'VOICE'], VALUE: ['uri'] }]
  }
}]
*/
```

---

## Testing

To run the unit tests:

```sh
npm test
```

---

## License

MIT License. Copyright (c) 2012 Wouter Vroege, 2026 Balanced02.
