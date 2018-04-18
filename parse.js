const fs = require('fs')
const fse = require('fs-extra');
const find = require('find');
const lexicalScope = require('lexical-scope')

const getOutputPath = inputPath => `output/${inputPath}`.replace(/\.txt$/, '.json')

find.eachfile(/\.txt/, './input', file => {
  console.log(file);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    const scope = lexicalScope(data)
    const scopeVars = scope.locals[''];
    eval(data);
    const output = scopeVars.reduce((acc, i) => {
      acc[i] = eval(i);
      return acc;
    }, {})
    fse.outputJSON(getOutputPath(file), output, err => {
      console.log(err);

    })
  })
})
