import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import extractTel from './index';
import { parseVcard } from './parser';

describe('vcfTelExtractor', function () {
  let readFileStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub fs.promises.readFile
    readFileStub = sinon.stub(fs.promises, 'readFile');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('extractTel Function (File Input)', () => {
    it('should reject if no path is provided', async function () {
      try {
        await extractTel('');
        expect.fail('Expected function to throw');
      } catch (e: any) {
        expect(e.message).to.equal('Path is a required argument');
      }
    });

    it('should reject with an error if file read fails', async function () {
      readFileStub.rejects(new Error('ENOENT: no such file or directory'));
      try {
        await extractTel('invalidpath');
        expect.fail('Expected function to throw');
      } catch (e: any) {
        expect(e.message).to.equal('ENOENT: no such file or directory');
      }
    });

    it('should read file and parse correctly', async function () {
      const mockData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
      readFileStub.resolves(mockData);

      const result = await extractTel('contacts.vcf');
      expect(result).to.deep.equal([
        {
          number: '+1234567890',
          firstName: 'John Doe',
          email: 'john.doe@example.com',
          version: '3.0',
        },
      ]);
    });
  });

  describe('parseVcard Function (Direct String Input)', () => {
    it('should parse simple vCard content', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD`;
      const result = parseVcard(data);
      expect(result).to.deep.equal([
        {
          number: '+1234567890',
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });

    it('should handle onlyNumbers option and prefix options', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD`;
      const resultPrefix = parseVcard(data, { onlyNumbers: true, prefix: true });
      expect(resultPrefix).to.deep.equal(['+1234567890']);

      const resultNoPrefix = parseVcard(data, { onlyNumbers: true, prefix: false });
      expect(resultNoPrefix).to.deep.equal(['1234567890']);
    });

    it('should filter fields when fields option is provided', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD`;
      const result = parseVcard(data, { fields: ['number', 'firstName'] });
      expect(result).to.deep.equal([
        {
          number: '+1234567890',
          firstName: 'John Doe',
        },
      ]);
    });

    it('should handle empty file/string gracefully', () => {
      const result = parseVcard('');
      expect(result).to.deep.equal([]);
    });

    it('should parse multiple contacts correctly', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD\n\nBEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+1234567891\nEND:VCARD`;
      const result = parseVcard(data);
      expect(result).to.deep.equal([
        { number: '+1234567890', firstName: 'John Doe', version: '3.0' },
        { number: '+1234567891', firstName: 'Jane Doe', version: '3.0' },
      ]);
    });

    it('should handle large input gracefully', () => {
      const contact = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD\n`;
      const largeData = contact.repeat(5000);
      const result = parseVcard(largeData);
      expect(result).to.be.an('array').that.has.lengthOf(5000);
    });

    it('should correctly unfold folded lines', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John \n Doe\nTEL:+123\n 4567890\nEND:VCARD`;
      const result = parseVcard(data);
      expect(result).to.deep.equal([
        {
          number: '+1234567890',
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });

    it('should handle colons inside values correctly (e.g. URLs)', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nURL:https://example.com/john?id=123\nEND:VCARD`;
      const result = parseVcard(data);
      expect(result).to.deep.equal([
        {
          firstName: 'John Doe',
          version: '3.0',
          URL: 'https://example.com/john?id=123',
        },
      ]);
    });

    it('should support custom key mappings', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nORG:Google\nEND:VCARD`;
      const result = parseVcard(data, {
        mappings: {
          ORG: 'company',
          FN: 'name',
        },
      });
      expect(result).to.deep.equal([
        {
          number: '+1234567890',
          name: 'John Doe',
          company: 'Google',
          version: '3.0',
        },
      ]);
    });

    it('should normalize phone numbers using libphonenumber-js when normalize option is true', () => {
      // US local number format with spaces/parentheses
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:(650) 555-0199\nEND:VCARD`;
      const result = parseVcard(data, {
        normalize: true,
        countryCode: 'US',
      });
      expect(result).to.deep.equal([
        {
          number: '+16505550199', // Normalized to E.164
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });

    it('should support custom normalize callback function', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD`;
      const result = parseVcard(data, {
        normalize: (num) => `PHONE:${num}`,
      });
      expect(result).to.deep.equal([
        {
          number: 'PHONE:+1234567890',
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });

    it('should parse multi-value fields as arrays by default', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+12345\nTEL:+67890\nEND:VCARD`;
      const result = parseVcard(data);
      expect(result).to.deep.equal([
        {
          number: ['+12345', '+67890'],
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });

    it('should support multiValueMode set to "last"', () => {
      const data = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+12345\nTEL:+67890\nEND:VCARD`;
      const result = parseVcard(data, { multiValueMode: 'last' });
      expect(result).to.deep.equal([
        {
          number: '+67890',
          firstName: 'John Doe',
          version: '3.0',
        },
      ]);
    });
  });
});
