var readFile = require("./readFile");

function extractTel(path, callback, { prefix = false } = {}) {
  if (!path) callback(new Error("Please provide a path"));
  readFile(path, (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    let newData = data.replace(/-|\s/g, " ");
    let re = /([0-9]{9})\w*/g;
    if (prefix) re = /(\+?[0-9]{9})\w*/g;
    let matches = newData.match(re);
    callback(null, matches);
  });
}

module.exports = extractTel;
