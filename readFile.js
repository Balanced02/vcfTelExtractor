const fs = require('fs');

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err); // if an error occurs, reject the Promise
      resolve(data.toString()); // if successful, resolve the Promise
    });
  });
}

module.exports = readFile;
