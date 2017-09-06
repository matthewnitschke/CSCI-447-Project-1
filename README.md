# Arff Convert

### Usage
```
node arffConvert.js [filename] [types...]
```

Example
```
node arffConvert.js youtube.csv string string date string real
```

### Things to note

* If a date type was used, the program will ask what format the date is in. If date is in ISO-8601 format, simply type `iso`

* all `.csv` files must contain a header line which lists each column name separated by a comma
