import { parseVcard as _parseVcard } from './parser';
import { ExtractTelOptions, Contact } from './types';

async function extractTel(
  input: string,
  options: ExtractTelOptions = {}
): Promise<Contact[] | string[]> {
  if (!input) {
    throw new Error('Path is a required argument');
  }

  // Browser does not support reading files from paths, only raw strings.
  return _parseVcard(input, options);
}

// Merge namespace with function to expose static property in TypeScript
namespace extractTel {
  export const parseVcard = _parseVcard;
}

export { _parseVcard as parseVcard };
export * from './types';
export default extractTel;
