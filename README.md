# Arff Convert

## Usage
```
node arffConvert.js [filename] [types...]
```

Example
```
node arffConvert.js youtube.csv string string date string real
```

### Special Types
there are two special types.
* `date` - requires a format for the date, if using ISO-8601 format enter `iso`
* `enum` - requires a comma separated list of enum options

## Important note
all `.csv` files must contain a header line which lists each column name separated by a comma
