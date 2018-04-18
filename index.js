const find = require('find');
const { spawn } = require('child_process');
const fse = require('fs-extra');
const path = require('path');

const DEFAULT = {
  entryDir: path.resolve('.\\input'),
  outputDi: path.resolve('.\\output'),
  errorDir: path.resolve('.\\parseError'),
  findPattern: /\.txt/
};

function parseCmdArgs() {
  args = process.argv.slice(2);
  entryDir = args[0] || DEFAULT.entryDir;
  outputDir = args[1] || DEFAULT.outputDi;
  errorDir = args[2] || DEFAULT.errorDir;
  findPattern = args[3] || DEFAULT.findPattern;
}

const getOutputPath = (inputPath, entry = entryDir) => {
  const fileSuffix = inputPath.replace(entry, '');
  return `${outputDir}\\${fileSuffix}`.replace(/\.txt$/, '.json');
}

const getErrorDir = (inputPath, entry = entryDir) => {
  const fileSuffix = inputPath.replace(entry, '');
  return `${errorDir}\\${fileSuffix}`;
}

let branchCounter = 0;
let errorCounter = 0;

function main() {
  parseCmdArgs();
  cleanDir();
  find.eachfile(findPattern, entryDir, file => {
    console.log(file);

    const child = spawn('node', ['child_parse.js', file, getOutputPath(file), getErrorDir(file)]);
    branchCounter++;
    listenChild(child);
  })
}

function cleanDir() {
  fse.removeSync(outputDir);
  fse.removeSync(errorDir);
  console.log('Directories of output & error have been cleared.');
  console.log('Starting to parse ...')
}

function listenChild(child) {
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    errorCounter++;
  });

  child.on('close', (code) => {
    // console.log(`child process exited with code ${code}`);
    branchCounter--;
    if (branchCounter === 0) {
      console.log(`Occurred ${errorCounter} errors.`)
      console.log('Parsing process Finished.')
    }
  });
}

main();

