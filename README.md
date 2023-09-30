# vcfTelExtractor

`vcfTelExtractor` is a node.js module designed to extract telephone numbers along with other specified fields from vCard (.vcf) files. The module is highly customizable allowing users to specify output fields and format, making it a versatile solution for any project requiring parsing vCard files.

## Installation

To install the `vcfTelExtractor` module, use the following npm command:

```sh
npm install vcfTelExtractor
```

# Usage
## Importing the Module
To import the vcfTelExtractor module, require it in your file as shown below:

```
const extractTel = require('vcfTelExtractor');
```

### extractTel Function
`extractTel` function is the core of this module. It parses the vCard files and extracts the required information based on the provided options.

#### Parameters
- path (String): The path to the vCard file. This is a required parameter.
- options (Object): An optional parameter object containing the following properties:
	- fields (Array): Defines the keys that should be present in the output. If not provided, all available fields will be included.
	- onlyNumbers (Boolean): When true, the function returns only an array of telephone numbers. Default is false.
	- prefix (Boolean): When true, the extracted telephone numbers will include the prefix. Default is false.

##### Fields and Key Mappings
The following key mappings are utilized to enhance the readability of the output:

- `TEL` => number
- `FN` => firstName
- `EMAIL` => email
- `VERSION` => version

### Example Usage
Here is an example demonstrating how to use the extractTel function with the optional parameters:

```
extractTel('./contacts.vcf', { fields: ['number', 'firstName'], prefix: true })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Testing
`vcfTelExtractor` comes with extensive test cases, providing coverage for a variety of scenarios and edge cases. To run the tests, execute the following command:

```
npm test
```

### Errors and Exception Handling
This module is designed to handle errors gracefully by rejecting the promise returned by the extractTel function. Users should implement appropriate error handling in their applications.

### Contribution
We welcome and appreciate contributions to enhance vcfTelExtractor. Please ensure any contributed code is accompanied by relevant tests.

### License

(The MIT License)

Copyright (c) 2012 Wouter Vroege

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
