import { parseVcard as _parseVcard } from './parser';
import { ExtractTelOptions, Contact } from './types';
import * as fs from 'fs';

async function extractTel(
  input: string,
  options: ExtractTelOptions = {}
): Promise<Contact[] | string[]> {
  if (!input) {
    throw new Error('Path is a required argument');
  }

  const isVcardContent = input.trim().startsWith('BEGIN:VCARD') || input.includes('\n');

  if (isVcardContent) {
    return _parseVcard(input, options);
  }

  // Node.js filesystem read
  const content = await fs.promises.readFile(input, 'utf8');
  return _parseVcard(content, options);
}

// Merge namespace with function to expose static property in TypeScript
namespace extractTel {
  export const parseVcard = _parseVcard;
}

export { _parseVcard as parseVcard };
export * from './types';
export default extractTel;
