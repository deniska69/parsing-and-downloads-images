import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { URLS_LIST } from "./URLS_LIST.js";

const DIRECTORY_OUTPUT = "output";

const parse = () => {
  process.stdout.write("\x1Bc");

  for (const url in URLS_LIST) {
    axios
      .get(URLS_LIST[url]?.url, { responseType: "arraybuffer" })
      .then((html) => {
        const $ = cheerio.load(html.data);

        const titleFile = URLS_LIST[url]?.title;

        console.log("[FILE]:", titleFile);

        let result = [];

        $("#stock > div.catalogue-section")
          .children()
          .each((indexCategory, list) => {
            const attributesCategory = list?.attributes[0];

            if (
              attributesCategory?.name === "class" &&
              attributesCategory?.value === "inner"
            ) {
              const categoryTitle = $(list).text().trim();
              result.push({ title: categoryTitle });
            }

            if (
              attributesCategory?.name === "class" &&
              attributesCategory?.value === "catalogue-list"
            ) {
              let idsProducts = [];

              $(list)
                .children()
                .children()
                .each((indexProduct, product) => {
                  const attributesProduct = product?.attributes[1];

                  if (attributesProduct?.name === "data-product_id") {
                    idsProducts.push(attributesProduct?.value);
                  }
                });

              result[result?.length - 1].series = URLS_LIST[url]?.title;
              result[result?.length - 1].ids = idsProducts;
            }
          });

        result.forEach((item, indexCategory) => {
          createDir(URLS_LIST[url]?.title, item?.title);
        });

        writeJSON(URLS_LIST[url]?.title, result);
      });
  }
};

const createDir = async (title, name) => {
  if (!fs.existsSync(DIRECTORY_OUTPUT)) {
    fs.mkdirSync(DIRECTORY_OUTPUT);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${title}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${title}`);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${title}/${name}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${title}/${name}`);
  }
};

const writeJSON = async (title, json) => {
  if (!fs.existsSync(DIRECTORY_OUTPUT)) {
    fs.mkdirSync(DIRECTORY_OUTPUT);
  }

  if (!fs.existsSync(`${DIRECTORY_OUTPUT}/${title}`)) {
    fs.mkdirSync(`${DIRECTORY_OUTPUT}/${title}`);
  }

  fs.writeFile(
    `${DIRECTORY_OUTPUT}/${title}/${title}.json`,
    JSON.stringify(json),
    function (error) {
      if (error) {
        return console.log(error);
      }
      console.log(
        "\x1b[32m%s\x1b[0m",
        `The file \'${DIRECTORY_OUTPUT}/${title}/${title}.json\' was successfully written`
      );
    }
  );
};

parse();

export default {
  tabWidth: 3,
  useTabs: true,
  singleQuote: true,
  importOrder: ["^[./]"],
  importOrderSeparation: true,
};
