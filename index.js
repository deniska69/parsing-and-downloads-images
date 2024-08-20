import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as colors from "colors"; // Not delete - required for work colors log
import { URLS_LIST } from "./URLS_LIST.js";
import { sleep, createDir, logSuccess, logError, clearLog, DIRECTORY_OUTPUT, writeJSON } from "./helpers.js";

const parseProducts = async ({ url, title }) => {
  logSuccess("[Parse products]: ", `\'${title}\' ${url}`);

  let resultParsing = [];

  await axios
    .get(url)
    .then(({ data }) => {
      const $ = cheerio.load(data);

      $("#stock > div.catalogue-section")
        .children()
        .each((indexCategory, category) => {
          const name = category?.attributes[0]?.name;
          const value = category?.attributes[0]?.value;

          if (name === "class" && value === "inner") {
            const categoryTitle = $(category).text().trim();
            resultParsing.push({ title: categoryTitle, series: title });

            logSuccess("\n[New catogory]:", categoryTitle);
          } else if (name === "class" && value === "catalogue-list") {
            let products = [];

            $(category)
              .children()
              .children()
              .each((indexProduct, product) => {
                const name = product?.attributes[1]?.name;
                const id = product?.attributes[1]?.value;

                if (name === "data-product_id") {
                  const urlProduct = $(product).find("a").attr()?.href.trim();
                  products.push({ id, url: `https://expro-mebel.ru${urlProduct}` });

                  console.log(`[Product]: ${id}`, `${urlProduct.substring(0, 39)}...`.yellow);
                }
              });

            resultParsing[resultParsing?.length - 1].products = products;
          }
        });
    })
    .catch((error) => logError(`[Parse products]: axios: \'${error}\'.`))
    .finally(() => {
      logSuccess("[Parse products]:", `\'${title}\' was successfully ended.`);
      writeJSON(title, resultParsing);
      logSuccess("[END]\n");
    });
};

const parseSeries = async () => {
  clearLog();
  logSuccess("\n\n[START]");

  for (const index in URLS_LIST) {
    await parseProducts(URLS_LIST[index]);
  }
};

parseSeries();
