var readFile = require("./readFile");

function extractTel(path, callback = (err, data) => {}, {
  prefix = false
} = {}) {
  if (!callback) return;
  if (!path) return callback(new Error("Path is a required argument"))
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