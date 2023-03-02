import { type Browser, type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";

import getProductPageBestReviews from "./getProductPageBestReviews";
import selectAndOpenDepartament from "./selectAndOpenDepartament";

const prisma = new PrismaClient();

const getProductDescription = async (page: Page, browser: Browser) => {
  try {
    const aboutThisItemTopics = await page.$$("#feature-bullets li");
    const topics = await Promise.all(
      aboutThisItemTopics.map(async (topic) => {
        const text = (await page.evaluate(
          (topic) => topic.textContent,
          topic
        )) as string;

        return text;
      })
    );

    const descriptionInnerText = await page.$eval(
      "#aplus_feature_div",
      (description) => (description as HTMLElement).innerText
    );

    if (!descriptionInnerText) {
      throw new Error("No description found on URL " + page.url());
    }

    const breadCrumbCategory = await page.$eval(
      "#wayfinding-breadcrumbs_feature_div",
      (title) => (title as HTMLElement).innerText as string
    );

    if (!breadCrumbCategory) {
      throw new Error("No breadCrumbCategory found on URL " + page.url());
    }

    const title = await page.$eval(
      "#productTitle",
      (title) => title.textContent!.replace(/\s+/g, " ").trim() as string
    );

    const productAsin = await page.$eval(
      "#productDetails_detailBullets_sections1",
      (asin) => asin.querySelector("td")?.innerText as string
    );

    if (!productAsin) {
      throw new Error("No productAsin found on URL " + page.url());
    }

    const product = await prisma.product.create({
      data: {
        description: descriptionInnerText,
        amazonURL: page.url(),
        aboutProductTopics: {
          create: topics.map((topic) => ({ name: topic })),
        },
        amazonASIN: productAsin,
        name: title,
        breadCrumbCategory: {
          connectOrCreate: {
            where: {
              name: breadCrumbCategory,
            },
            create: {
              name: breadCrumbCategory,
            },
          },
        },
      },
    });

    await getProductPageBestReviews(page, browser, product.id);
  } catch (err) {
    console.log(err);
    await prisma.product.deleteMany({
      where: {
        amazonURL: page.url(),
      },
    });
    await selectAndOpenDepartament(browser, page);
  }
};

export default getProductDescription;
