import { type Browser, type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";

import getProductPageBestReviews from "./getProductPageBestReviews";
import selectAndOpenDepartament from "./selectAndOpenDepartament";

const prisma = new PrismaClient();

const getProductDescription = async (
  page: Page,
  browser: Browser,
  linkToScrapeId: number
) => {
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
        amazonURL: page
          .url()
          .split("/")
          .slice(0, 6)
          .join("/")
          .split("?")[0] as string,
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

    getProductPageBestReviews(page, browser, product.id, linkToScrapeId);
  } catch (err) {
    await prisma.linkToScrap.update({
      where: {
        id: linkToScrapeId,
      },
      data: {
        scrapped: true,
        success: false,
      },
    });

    const nextLink = await prisma.linkToScrap.findFirst({
      where: {
        scrapped: false,
      },
    });

    console.log(nextLink);

    await page.goto(nextLink?.url!);

    getProductDescription(page, browser, nextLink?.id!).catch(async (err) => {
      const nextLink = await prisma.linkToScrap.findFirst({
        where: {
          scrapped: false,
        },
      });

      getProductDescription(page, browser, nextLink?.id!);
    });
  }
};

export default getProductDescription;
