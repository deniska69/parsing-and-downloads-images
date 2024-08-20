import * as fs from "fs";
import * as colors from "colors"; // Not delete - required for work colors log

const DIRECTORY_OUTPUT = "output";

const logSuccess = (textFirst = "", textSecond = "") => {
  if (textSecond) {
    console.log(textFirst.white, textSecond.green);
  } else {
    console.log(textFirst.green);
  }
};

const logError = (textFirst = "", textSecond = "") => {
  if (textSecond) {
    console.log(textFirst.white, textSecond.red);
  } else {
    console.log(textFirst.red);
  }
};

const sleep = (milliseconds = 1000) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

const createDir = (dirFirst, dirSecond) => {
  if (!fs.existsSync(DIRECTORY_OUTPUT)) {
    fs.mkdirSync(DIRECTORY_OUTPUT);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${dirFirst}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${dirFirst}`);
  }

  const finalPath = `${DIRECTORY_OUTPUT}/${dirFirst}/${dirSecond}`;

  if (!fs.existsSync(finalPath)) {
    fs.mkdirSync(finalPath);
    logSuccess(`Directory \'${finalPath}\' was successfully`, "create.");
  }
};

const clearLog = () => process.stdout.write("\x1Bc");

const writeJSON = async (title, json) => {
  if (!fs.existsSync(DIRECTORY_OUTPUT)) {
    fs.mkdirSync(DIRECTORY_OUTPUT);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${title}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${title}`);
  }

  const finalPath = `${DIRECTORY_OUTPUT}/${title}/${title}.json`;

  fs.writeFile(finalPath, JSON.stringify(json), (error) => {
    if (error) {
      return console.log(error);
    }

    logSuccess(`The file \'${finalPath}\' was successfully written.`);
  });
};

export {
  sleep,
  createDir,
  logSuccess,
  logError,
  clearLog,
  DIRECTORY_OUTPUT,
  writeJSON,
};
