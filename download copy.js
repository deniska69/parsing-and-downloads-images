import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { URLS_LIST } from "./URLS_LIST.js";

const DIRECTORY_OUTPUT = "output";

const createDir = (series, title) => {
  if (!fs.existsSync(DIRECTORY_OUTPUT)) {
    fs.mkdirSync(DIRECTORY_OUTPUT);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${series}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${series}`);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${series}/${title}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${series}/${title}`);
  }
};

const saveImage = async (path, data) => {
  console.log("\nsaveImage");

  data
    .pipe(fs.createWriteStream(path))
    .on("finish", () => {
      console.log(
        "\x1b[31m%s\x1b[0m",
        `Image ${path} was successfully written.`
      );
    })
    .on("error", (e) => {
      console.log("\x1b[31m%s\x1b[0m", `Error on write image.`);
    });
};

const downloadImage = async (path, url) => {
  const arr = url.split("/");
  const fileName = arr[arr?.length - 1];

  if (fs.existsSync(`${path}/${fileName}`)) {
    console.log("\x1b[31m%s\x1b[0m", `File exist. ${path}/${fileName}`);
    return;
  }

  sleep();
  console.log(`Image download: ${path}/${fileName}`);

  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    // Create a write stream to save the image
    const writer = fs.createWriteStream(url);

    // Pipe the response data into the writer stream
    response.data.pipe(writer);

    // Wait for the image to finish downloading
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(
      "\x1b[32m%s\x1b[0m",
      `Image: ${path}/${fileName} downloaded successfully!`
    );
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", `Error downloading image:`);
    console.error(Object.keys(error.message));
  }
};

const downloadImage2 = (path, url) => {
  const arr = url.split("/");
  const fileName = arr[arr?.length - 1];

  if (fs.existsSync(`${path}/${fileName}`)) {
    console.log("\x1b[31m%s\x1b[0m", `File exist. ${path}/${fileName}`);
    return;
  }

  // console.log("\x1b[32m%s\x1b[0m", `File download! ${path}/${fileName}`);
  sleep();
  console.log(`File download! ${path}/${fileName}`);

  axios({ url, responseType: "stream" })
    .then((response) => {
      saveImage(response?.data);
      // new Promise((resolve, reject) => {
      //   response.data
      //     .pipe(fs.createWriteStream(`${path}/${fileName}`))
      //     .on("finish", () => resolve())
      //     .on("error", (e) => reject(e));
      // });
    })
    .catch((error) => {
      console.log("--------------------------------------");
      console.log("\x1b[31m%s\x1b[0m", `Error file download.`);
      console.log("\x1b[31m%s\x1b[0m", `${url}`);
      console.log("");
      // console.log(error?.message);
    });
};

const parseProduct = (path, id) => {
  const url = `https://expro-mebel.ru/catalog/product/${id}/0/`;

  axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((html) => {
      const $ = cheerio.load(html.data);

      const selector =
        ".inner.product-column-holder > div:nth-child(1) > div.product-tabs-list > div > div";

      $(selector)
        .children()
        .each((index, item) => {
          const imageUri =
            "https://expro-mebel.ru/" + $(item).find("img").attr()?.src;

          downloadImage(path, imageUri);
        });
    });
};

const processJSON = (json) => {
  json.forEach((item, index) => {
    if (item?.ids?.length > 0) {
      item?.ids.forEach((id) => {
        createDir(item?.series, item?.title);
        parseProduct(`${DIRECTORY_OUTPUT}/${item?.series}/${item?.title}`, id);
      });
    }
  });
};

const readJSON = () => {
  process.stdout.write("\x1Bc");

  URLS_LIST.forEach((item) => {
    fs.readFile(
      `${DIRECTORY_OUTPUT}/${item?.title}/${item?.title}.json`,
      function (error, data) {
        if (error) {
          return console.log("Error read json file.");
        }

        console.log(
          "\x1b[32m%s\x1b[0m",
          `The file \'${DIRECTORY_OUTPUT}/${item?.title}/${item?.title}.json\' was successfully read.`
        );

        processJSON(JSON.parse(data));
      }
    );
  });
};

readJSON();

export default {
  tabWidth: 3,
  useTabs: true,
  singleQuote: true,
  importOrder: ["^[./]"],
  importOrderSeparation: true,
};

function sleep(milliseconds = 5000) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
