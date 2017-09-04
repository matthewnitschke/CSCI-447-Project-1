var fs = require("fs");

var relationName = "youtube"; // the name of the relation, not really sure what this is
var fileName = "youtube.csv"; // the actual file name of the csv file

function getType(str){
  if (!isNaN(str.trim())){
    return 'real';
  } else {
    return 'string';
  }
}

function splitIgnoreCommaInQuote(str){
  // Regex from: https://stackoverflow.com/questions/632475/regex-to-pick-commas-outside-of-quotes
  return str.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/gm);
}

var file = "";
fs.readFile(fileName, function(err, data){
  var dt = data.toString();

  var lines = dt.split('\n');

  var headerLine = lines[0];
  var headers = splitIgnoreCommaInQuote(headerLine);

  var dataLine = lines[1];
  var dataTypes = splitIgnoreCommaInQuote(dataLine).map((item) => {
    return getType(item);
  });

  file += `@RELATION ${relationName}\n\n`;

  for(var i = 0; i < headers.length; i ++){
    var header = headers[i];

    // if header containes spaces, wrap in quotes
    if (header.indexOf(' ') > -1){
      header = `"${header}"`;
    }

    var type = dataTypes[i];

    file += `@ATTRIBUTE ${header} ${type}\n`;
  }

  file += "\n@DATA";

  file += dt.substring(dt.indexOf('\n'));


  fs.writeFile(fileName.split('.')[0] + ".arff", file);

 });
