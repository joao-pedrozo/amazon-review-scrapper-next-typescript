import { type Browser, type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";

import getProductPageBestReviews from "./getProductPageBestReviews";
import selectAndOpenDepartament from "./selectAndOpenDepartament";

const prisma = new PrismaClient();

const getProductDescription = async (page: Page, browser: Browser) => {
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

  try {
    const descriptionInnerText = await page.$eval(
      "[data-feature-name=productDescription]",
      (description) => (description as HTMLElement).innerText
    );

    const breadCrumbCategory = await page.$eval(
      "#wayfinding-breadcrumbs_feature_div",
      (title) => title.textContent as string
    );

    const product = await prisma.product.create({
      data: {
        description: descriptionInnerText,
        amazonURL: page.url(),
        aboutProductTopics: {
          create: topics.map((topic) => ({ name: topic })),
        },
        name: await page.$eval(
          "#productTitle",
          (title) => title.textContent as string
        ),
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
    await selectAndOpenDepartament(browser, page);
  }
};

export default getProductDescription;
