var fs = require("fs");
var readline = require('readline');

var isoDateFormat = "yyyy-MM-dd'T'HH:mm:ss";

processArgs().then((argumentData) => {

  var {fileName, types} = argumentData;

  var file = "";
  fs.readFile(fileName, function(err, data) {
  	var dt = data.toString();

  	var headerLine = dt.substring(0, dt.indexOf('\n'));
  	var headers = splitIgnoreCommaInQuote(headerLine);

    var relationName = fileName.substring(0, fileName.indexOf('.'));

  	file += `@relation '${relationName}'\n\n`;

  	for (var i = 0; i < headers.length; i++) {
  		var header = headers[i];

  		var type = types[i];

  		file += `@attribute '${header}' ${type}\n`;
  	}

  	file += "\n@data\n";

  	file += processData(dt.substring(dt.indexOf('\n')).trim(), types);

  	fs.writeFile(fileName.split('.')[0] + ".arff", file);
  });
})

function processArgs(){
  // get types from command line args
  var fileName = process.argv[2];

  var argTypes = process.argv.filter((arg, index) => {
  	return index > 2
  });

  var promises = [];
  argTypes.forEach((type, index) => {
  	if (type === "date") {
      promises.push(new Promise((resolve, reject) => {
        var rl = readline.createInterface({
    			input: process.stdin,
    			output: process.stdout
    		});

    		rl.question(`Enter format for date at index [${index}]: `, function(answer) {
          if (answer.trim() === 'iso'){
            answer = isoDateFormat;
          }
          argTypes[index] = `${argTypes[index]} '${answer}'`;
    			rl.pause();


          resolve();
    		});
      }))
  	}
  });

  return Promise.all(promises).then(() => {
    return {
      fileName: fileName,
      types: argTypes
    };
  });
}

function processData(data, types){
  var lines = data.split('\n');

  var retData = "";

  lines.forEach((line) => {
    var columns = splitIgnoreCommaInQuote(line);

    var newLine = "";

    columns.forEach((column, i) => {
      if (types[i] == 'string'){

        newLine += formatStringColumnData(column);
      } else {
        newLine += column;
      }

      // if column is not the last in the set, add a comma to end
      if (i < columns.length - 1){
        newLine += ",";
      }

    });

    retData += newLine + "\n";
  });

  return retData;
}


// Utility Functions

function formatStringColumnData(col){
  col = stripWrappedQuotes(col);
  col = escapeInvalidStringCharacters(col);
  return `'${col}'`;
}

function stripWrappedQuotes(str){
  var firstChar = str.substring(0,1);
  var lastChar = str.substring(str.length-1, str.length);
  if (firstChar == lastChar && (firstChar == `"` || firstChar == `'`)){
    return str.substring(1, str.length-1);
  }
  return str;
}

function escapeInvalidStringCharacters(str){
  return str = str.replace(/'/g, `\\'`); // escape all single quotes in data
}

function splitIgnoreCommaInQuote(str) {
	// Regex from: https://stackoverflow.com/questions/632475/regex-to-pick-commas-outside-of-quotes
	return str.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/gm);
}
