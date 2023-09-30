const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('extractTel Function', function() {
  
  let readFileStub;
  let extractTel;

  beforeEach(() => {
    // Reset the stub before each test
    readFileStub = sinon.stub();
    extractTel = proxyquire('./index', { './readFile': readFileStub });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should reject if no path is provided', async function() {
    try {
      await extractTel();
      expect.fail('Expected function to throw');
    } catch (e) {
      expect(e.message).to.equal('Path is a required argument');
    }
  });

  it('should reject with an error if an invalid path is provided', async function() {
    readFileStub.rejects(new Error('ENOENT: no such file or directory'));
    try {
      await extractTel('invalidpath');
      expect.fail('Expected function to throw');
    } catch (e) {
      expect(e.message).to.equal('ENOENT: no such file or directory');
    }
  });

  it('should return numbers with prefix when onlyNumbers and prefix options are true', async function() {
    const mockData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(mockData);
    const result = await extractTel('somepath', { onlyNumbers: true, prefix: true });
    expect(result).to.deep.equal(['+1234567890']);
  });

  it('should return numbers without prefix when onlyNumbers is true and prefix is false', async function() {
    const mockData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(mockData);
    const result = await extractTel('somepath', { onlyNumbers: true, prefix: false });
    expect(result).to.deep.equal(['1234567890']);
  });

  it('should return objects with the specified fields when fields option is provided', async function() {
    const mockData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(mockData);
  
    const result = await extractTel('somepath', { fields: ['number', 'firstName'] });
    
    const expectedResult = [{
      number: '+1234567890',
      firstName: 'John Doe'
    }];
    
    expect(result).to.deep.equal(expectedResult);
  });

  it('should return an empty array for an empty file', async function() {
    readFileStub.resolves('');
    const result = await extractTel('somepath');
    expect(result).to.deep.equal([]);
  });
  
  it('should handle invalid option values gracefully', async function() {
    const validData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(validData);
    try {
      const result = await extractTel('somepath', { onlyNumbers: 'invalid' });
      expect(result).to.be.an('array'); // or your desired behavior for invalid option values
    } catch (e) {
      expect.fail('Function should not throw');
    }
  });

  it('should correctly parse multiple contacts', async function() {
    const multipleContactsData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD\n\nBEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+1234567891\nEMAIL:jane.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(multipleContactsData);
    const result = await extractTel('somepath');
    expect(result).to.deep.equal([
      { number: '+1234567890', firstName: 'John Doe', email: 'john.doe@example.com', version: '3.0' },
      { number: '+1234567891', firstName: 'Jane Doe', email: 'jane.doe@example.com', version: '3.0' }
    ]);
  });

  it('should handle large files gracefully', async function() {
    const singleContact = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD\n\n`;
    const largeData = singleContact.repeat(10000);
    readFileStub.resolves(largeData);
    try {
      const result = await extractTel('somepath');
      expect(result).to.be.an('array').that.has.lengthOf(10000);
    } catch (e) {
      expect.fail('Function should not throw');
    }
  });

  it('should handle valid and invalid combinations of options gracefully', async function() {
    const validData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(validData);
    const result = await extractTel('somepath', { onlyNumbers: true, fields: ['number', 'invalidField'] });
    expect(result).to.deep.equal(['1234567890']); // or your desired behavior for such combinations
  });
  
  it('should return all fields when the fields option is not provided', async function() {
    const validData = `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john.doe@example.com\nEND:VCARD`;
    readFileStub.resolves(validData);
    const result = await extractTel('somepath');
    expect(result).to.deep.equal([{ number: '+1234567890', firstName: 'John Doe', email: 'john.doe@example.com', version: '3.0' }]);
  });
  
});
