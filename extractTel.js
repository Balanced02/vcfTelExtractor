import readFile from './readFile'

export default function extractTel(path, callback, {
  countryPrefix = false
} = {}) {
  if (!path) callback('Please provide a path')
  readFile(path, (err, data) => {
    if (err) {
      callback(err)
      return
    }
    let newData = data.replace(/-|\s/g, ' ')
    let re = /([0-9]{9})\w*/g
    if (countryPrefix) re = /(\+?[0-9]{9})\w*/g
    let matches = newData.match(re)
    callback(null, matches)
  })
}