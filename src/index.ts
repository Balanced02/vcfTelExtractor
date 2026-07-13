import { parseVcard as _parseVcard } from './parser';
import { ExtractTelOptions, Contact } from './types';

// Check if environment is a browser
const isBrowser = typeof window !== 'undefined' || typeof document !== 'undefined';

async function extractTel(
  input: string,
  options: ExtractTelOptions = {}
): Promise<Contact[] | string[]> {
  if (!input) {
    throw new Error('Path is a required argument');
  }

  // Check if input is likely vCard string content instead of a path
  const isVcardContent = input.trim().startsWith('BEGIN:VCARD') || input.includes('\n');

  if (isVcardContent) {
    return _parseVcard(input, options);
  }

  if (isBrowser) {
    throw new Error(
      'File path reading is not supported in browser environment. Please pass raw vCard string content instead.'
    );
  }

  try {
    // Dynamic import of fs to prevent bundlers from throwing errors in browser environment
    const fs = await import('fs');
    const content = await fs.promises.readFile(input, 'utf8');
    return _parseVcard(content, options);
  } catch (err: any) {
    throw err;
  }
}

// Attach parseVcard and other exports to the main function for CJS compatibility
namespace extractTel {
  export const parseVcard = _parseVcard;
}

export = extractTel;
