const fs = require('fs')
const contentFilePath = './content.json'

function save(busca) {
  const contentString = JSON.stringify(busca)
  return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
  const contentJson = JSON.parse(fileBuffer)
  return contentJson
}

module.exports = {
  save,
  load
}