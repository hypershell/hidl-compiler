
var parse = require('./idl-parse.js')

var filePath = process.argv[2]
console.log('parsing file', filePath)

parse.parseFile(filePath, function(err, ast) {
  if(err) return console.log('parse error:', err)

  console.log(JSON.stringify(ast))
})