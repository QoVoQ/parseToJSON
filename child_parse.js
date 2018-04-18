const fs = require('fs');
const fse = require('fs-extra');
const detectLexicalScope = require('lexical-scope');

let args = [];
let inputFilePath
let outputFilePath
let errorFilePath

function parseCmdArgs() {
  args = process.argv.slice(2);
  inputFilePath = args[0];
  outputFilePath = args[1];
  errorFilePath = args[2];
}

function logError(error) {
  console.log(`Error occurred: ${inputFilePath}`);
  console.log(error);
  console.log(inputFilePath, errorFilePath, '----------')
  fse.copy(inputFilePath, errorFilePath, err => {
    console.log('Fail to copy to error dir');
  });
}

function parseLexicalScope(code) {
  const scopeVars = detectLexicalScope(code).locals[''];
  eval(code);
  const scopeObj = scopeVars.reduce((acc, i) => {
    acc[i] = eval(i);
    return acc;
  }, {})
  return scopeObj;
}

function writeJson(dataObj, outputPath = outputFilePath) {
  return new Promise((resolve, reject) => {
    fse.outputJson(outputFilePath, dataObj, err => {
      err
        ? reject(err)
        : resolve();
    })
  });
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, file) => {
      err
        ? reject(err)
        : resolve(file);
    })
  })
}

function main() {
  parseCmdArgs();
  readFile(inputFilePath)
    .then(parseLexicalScope)
    .then(writeJson)
    .catch(logError);
}

main();
