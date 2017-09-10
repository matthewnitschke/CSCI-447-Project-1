var fs = require("fs");
var readline = require('readline');

var isoDateFormat = "yyyy-MM-dd'T'HH:mm:ss";

var arffConvert = function(){
	var self = this;

	self.processArgs = function(){
		// file name is at index 2
		var fileName = process.argv[2];

		// type arguments are any index after 2
		var argTypes = process.argv.filter((arg, index) => {
			return index > 2
		});

		// iterate through each type argument.
		// If type is a "date", ask user what format. Because user input is async, use Promises to return result

		return new Promise((resolve) => {
			function iteration(type, index) {
				function iterate(){
					if (index + 1 > argTypes.length){

						resolve({
							fileName: fileName,
							types: argTypes
						})
					} else {
						var nextType = argTypes[index+1];
						iteration(nextType, index+1);
					}
				}

				if (type === "date"){
					askQuestion(`Enter format for date at index [${index}]: `).then((answer) => {
						if (answer.trim() === 'iso') {
							answer = isoDateFormat;
						}
						argTypes[index] = `${argTypes[index]} '${answer}'`;

						iterate();
					})
				} else if (type === "enum"){
					askQuestion(`Enter options for enum type at index [${index}] separated by a comma: `).then((answer) => {
						var enumOptions = splitIgnoreCommaInQuote(answer).reduce((accumulator, currentValue, index, array) => {
							if (index == 0){
								accumulator += "{ ";
							}

							accumulator += formatStringColumnData(currentValue.trim());

							if (index < array.length-1){
								accumulator += ", ";
							} else {
								accumulator += " }";
							}

							return accumulator;
						}, "");

						argTypes[index] = `${enumOptions}`;

						iterate();
					})
				} else {
					iterate();
				}
			}
			iteration(argTypes[0], 0);
		});
	}
	self.processData = function(data, types){
		var lines = data.split('\n');

		var retData = "";

		lines.forEach((line) => {
			var columns = splitIgnoreCommaInQuote(line);

			var newLine = "";

			columns.forEach((column, i) => {
				if (types[i] == 'string') {
					newLine += formatStringColumnData(column);
				} else {
					newLine += column;
				}

				// if column is not the last in the set, add a comma to end
				if (i < columns.length - 1) {
					newLine += ",";
				}
			});

			retData += newLine + "\n";
		});

		return retData;
	}

	self.convert = function(){

		self.processArgs().then((argumentData) => {

			var { fileName, types } = argumentData;

			fs.readFile(fileName, function(err, data) {
				var dt = data.toString();

				// get the first line of the .csv file and split it by its commas
				var headerLine = dt.substring(0, dt.indexOf('\n'));
				var headers = splitIgnoreCommaInQuote(headerLine);

				// strip off the .csv part of the filename, use it as the relation name
				var relationName = fileName.substring(0, fileName.indexOf('.'));

				var file = `@relation '${relationName}'\n\n`;

				for (var i = 0; i < headers.length; i++) {
					var header = headers[i];

					var type = types[i];

					file += `@attribute '${header}' ${type}\n`;
				}

				file += "\n@data\n";

				// get rest of .csv excluding header line
				var csvData = dt.substring(dt.indexOf('\n')).trim();
				file += self.processData(csvData, types);

				fs.writeFile(fileName.split('.')[0] + ".arff", file);
			});
		});
	}

	// Utility Functions
	function askQuestion(questionText){
		return new Promise((resolve) => {
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			rl.question(questionText, (answer) => {
				rl.close();
				resolve(answer);
			})
		})
	}

	function formatStringColumnData(col) {
		col = stripWrappedQuotes(col);
		col = escapeInvalidStringCharacters(col);
		return `'${col}'`;
	}

	function stripWrappedQuotes(str) {
		var firstChar = str.substring(0, 1);
		var lastChar = str.substring(str.length - 1, str.length);

		// The str is wrapped in quotes if the firstChar and lastChar are the same and they are single or double quotes
		if (firstChar == lastChar && (firstChar == `"` || firstChar == `'`)) {
			return str.substring(1, str.length - 1); // if they are wrapped, strip them
		}
		return str;
	}

	function escapeInvalidStringCharacters(str) {
		return str = str.replace(/'/g, `\\'`); // escape all single quotes in data
	}

	function splitIgnoreCommaInQuote(str) {
		// Use regex to split a string by its commas, but exclude any commas inside quotes

		// Regex from: https://stackoverflow.com/questions/632475/regex-to-pick-commas-outside-of-quotes
		return str.trim().split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/gm);
	}
}

var converter = new arffConvert();
converter.convert();
