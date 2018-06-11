function readFile(path, callback) {
  require('fs').readFile(path, function (err, data) {
    if (err) return callback(err)
    callback(null, data.toString())
  })
}

module.exports = readFile