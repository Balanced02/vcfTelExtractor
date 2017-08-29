function readFile(path, callback) {
  require('fs').readFile(path, function(err, data) {
    if (err) return callback(err)
    callback(null, data.toString())
  })
}

function extractTel(path, callback) {
  readFile(path, (err, data) => {
    if (err) {
      callback(err)
      return
    }
    let newData = data.replace(/-|\s/g, ' ')
    let re = /([0-9]{9})\w*/g
    let matches = newData.match(re)
    callback(null, matches)
  })
}
