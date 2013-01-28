
var fs = require('fs')

var readFile = function(filePath, callback) {
  var fileStream = fs.createReadStream(filePath)
  var content = ''

  fileStream.on('data', function(data) {
    content += data
  })

  fileStream.on('end', function() {
    callback(null, content)
  })

  fileStream.on('error', function(err) {
    callback(err)
  })
}

var removeEmptyLines = function(lines) {
  var result = []
  lines.forEach(function(line) {
    if(!line.match(/^\s*$/)) {
      result.push(line)
    }
  })
  return result
}

var splitLines = function(string) {
  return string.split(/\n/)
}

var countIndentation = function(line) {
  return line.match(/^( *)/)[0].length
}

var lineToTokens = function(line) {
  var tokens = line.trim().split(/\s+/)

  var result = []
  var current = result

  tokens.forEach(function(token) {
    var firstChar = token.charAt(0)
    var lastChar = token.charAt(token.length-1)
    if(firstChar == '(' || firstChar == '[') {
      current = []
      current.push(token.substr(1))
    } else if(lastChar == ')' || lastChar == ']') {
      current.push(token.substr(0, token.length-1))
      result.push(current)
      current = result
    } else {
      current.push(token)
    }
  })

  return result
}

var parseCurrentIndentation = function(currentIndent, output, lines) {
  if(lines.length == 0) return

  var line = lines[0]
  var indentLevel = countIndentation(line)

  if(indentLevel == currentIndent) {
    output.push(lineToTokens(line))

    lines.shift()
    parseCurrentIndentation(currentIndent, output, lines)

  } else if(indentLevel > currentIndent) {
    parseCurrentIndentation(indentLevel, output[output.length-1], lines)

    parseCurrentIndentation(currentIndent, output, lines)
  }
}

var parse = exports.parse = function(source) {
  var lines = removeEmptyLines(splitLines(source))

  var results = []
  parseCurrentIndentation(0, results, lines)

  return results
}

exports.parseFile = function(filePath, callback) {
  readFile(filePath, function(err, source) {
    if(err) return callback(err)

    callback(null, parse(source))
  })
}