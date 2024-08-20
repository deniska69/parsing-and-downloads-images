import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { URLS_LIST } from "./URLS_LIST.js";
import { sleep, createDir, logSuccess, logError, clearLog, DIRECTORY_OUTPUT, writeJSON } from "./helpers.js";

const getUrl = (id) => `https://expro-mebel.ru/catalog/product/${id}/0/`;

const getImages = async (urlProduct) => {
  logSuccess("[GET]:", urlProduct);

  axios
    .get(urlProduct)
    .then((html) => {
      const $ = cheerio.load(html.data);

      const selector = ".inner.product-column-holder > div:nth-child(1) > div.product-tabs-list > div > div";

      let images = [];

      $(selector)
        .children()
        .each((index, item) => {
          const uriImage = "https://expro-mebel.ru/" + $(item).find("img").attr()?.src;

          // logSuccess(`[${productId}]:`, uriImage);
          logSuccess(`[image]:`, uriImage);

          images.push(uriImage);
        });

      // return Promise.resolve(images);
    })
    .catch((error) => {
      logError(error?.message);
      // return Promise.reject(error?.message);
    });
};

const processJSON = (json) => {
  json.forEach((item) => createDir(item?.series, item?.title));
  logSuccess("All directories have been created.");

  json.forEach(async (category, categoryIndex) => {
    if (category?.ids?.length > 0) {
      console.log("[category]:", category?.title);

      for (const productId of category?.ids) {
        const func = await getImages(getUrl(productId));

        func()
          .then((imagesArray) => {
            logSuccess("\n[imagesArray]:");
            console.log(imagesArray);
          })
          .catch((error) => logError(error));
      }
    }
  });
};

const readJSON = () => {
  clearLog();

  return getImages(getUrl(12525));

  URLS_LIST.forEach((item) => {
    const path = `${DIRECTORY_OUTPUT}/${item?.title}/${item?.title}.json`;

    fs.readFile(path, (error, data) => {
      if (error) {
        return logError(`Error read \'${path}\' file.`);
      }
      logSuccess(`The file \'${path}\' was successfully read.`);
      processJSON(JSON.parse(data));
    });
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
