var readFile = require("./readFile");

/**
 * Extracts contact information from a vCard (.vcf) file located at the given path.
 *
 * @function
 * @async
 * @param {string} path - The path to the vCard (.vcf) file.
 * @param {Object} [options] - Optional parameters.
 * @param {string[]} [options.fields=[]] - Specific fields to extract from the vCard file. 
 *     Acceptable values are: 
 *     - 'number' for TEL
 *     - 'firstName' for FN
 *     - 'email' for EMAIL
 *     - 'version' for VERSION
 *     If empty, extracts all fields.
 * @param {boolean} [options.onlyNumbers=false] - If true, extracts only phone numbers from the vCard file.
 * @param {boolean} [options.prefix=false] - If true, includes prefixes in the extracted phone numbers.
 * @throws Will reject with an error if the file read operation fails, or if no path is provided.
 * @returns {Promise<Array<string>|Array<Object>>} - A promise that resolves with an array of strings (when `onlyNumbers` is true), 
 * or an array of objects representing the extracted contacts (when `onlyNumbers` is false).
 *
 * @example
 * extractTel('path-to-file', { fields: ['number', 'firstName'] })
 *   .then(data => console.log(data))
 *   .catch(err => console.error(err));
 */
function extractTel(path, options = { fields: [], onlyNumbers: false, prefix: false }) {
  return new Promise((resolve, reject) => {
    // If no path provided, reject the promise with an Error
    if (!path) return reject(new Error("Path is a required argument"));

    const keyMapping = {
      TEL: "number",
      FN: "firstName",
      EMAIL: 'email',
      VERSION: 'version'
    };

    readFile(path)
      .then((data) => {
        if (options.onlyNumbers) {
          let newData = data.replace(/-|\s/g, " ");
          let re = options.prefix ? /(\+[0-9]{1,15})\b/g : /([0-9]{9,15})\b/g;
          let matches = newData.match(re) || [];
          matches = matches.filter(match => !/^3$|^0$/.test(match)); // filter out unwanted '3' and '0'
          return resolve(matches);
        }

        let contacts = [];
        let lines = data.split("\n");
        let currentContact = {};

        lines.forEach((line) => {
          let [key, value] = line.split(":");
          // Ignoring the BEGIN and END keys
          if (key === "BEGIN" || key === "END") {
            return
          }
          let mappedKey = keyMapping[key] || key;
          if (options.fields.length === 0 || options.fields.includes(mappedKey)) {
            if (mappedKey === "number") {
              currentContact[mappedKey] = value.replace(/-|\s/g, " ");
            } else {
              currentContact[mappedKey] = value;
            }
          }

          if (line === "") {
            delete currentContact['']
            if (Object.keys(currentContact).length > 0) {
              contacts.push(currentContact);
              currentContact = {};
            }
          }
        });

        if (Object.keys(currentContact).length > 0) contacts.push(currentContact);
        resolve(contacts);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = extractTel;
