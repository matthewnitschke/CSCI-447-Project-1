var fs = require("fs");
var readline = require('readline');

// arg types: numeric, integer, real, string, date


var relationName = "youtube"; // the name of the relation, not really sure what this is
var fileName = "youtube.csv"; // the actual file name of the csv file

processTypes().then((types) => {

  var file = "";
  fs.readFile(fileName, function(err, data) {
  	var dt = data.toString();

  	var headerLine = dt.substring(0, dt.indexOf('\n'));
  	var headers = splitIgnoreCommaInQuote(headerLine);

  	file += `@RELATION ${relationName}\n\n`;

  	for (var i = 0; i < headers.length; i++) {
  		var header = headers[i];

  		// if header containes spaces, wrap in quotes
  		if (header.indexOf(' ') > -1) {
  			header = `"${header}"`;
  		}

  		var type = types[i];

  		file += `@ATTRIBUTE ${header} ${type}\n`;
  	}

  	file += "\n@DATA";

  	file += dt.substring(dt.indexOf('\n'));

  	fs.writeFile(fileName.split('.')[0] + ".arff", file);
  });
})


function splitIgnoreCommaInQuote(str) {
	// Regex from: https://stackoverflow.com/questions/632475/regex-to-pick-commas-outside-of-quotes
	return str.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/gm);
}


function processTypes(){
  // get types from command line args
  var argTypes = process.argv.filter((arg, index) => {
  	return index > 1
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
          argTypes[index] = `${argTypes[index]} "${answer}"`;
    			rl.pause();
          resolve();
    		});
      }))
  	}
  });

  return Promise.all(promises).then(()=>{
    return argTypes;
  });
}
